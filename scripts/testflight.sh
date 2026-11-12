#!/usr/bin/env bash
# Builds the Sparkz iPhone app and uploads it to TestFlight with no clicks in Xcode.
#
#   scripts/testflight.sh            sync, bump the build number, archive, upload
#   scripts/testflight.sh --dry-run  sync, bump, archive and export a signed .ipa; stops
#                                    before the upload and puts the build number back
#
# Steps: npx cap sync ios; bump the build number (CFBundleVersion, which Info.plist takes
# from CURRENT_PROJECT_VERSION); xcodebuild archive; xcodebuild -exportArchive with method
# app-store-connect and destination export (an .ipa on disk); xcrun altool --upload-app.
#
# Least privilege, split in two:
#   signing  uses the Apple ID signed in to Xcode on this Mac (Xcode > Settings > Accounts),
#            the same identity as an Archive click. No -authenticationKey flags, so the API
#            key does not need the Admin role that cloud signing would require.
#   upload   uses the App Store Connect API key, which the App Manager role may do.
#
# Inputs (the script stops with a message if any is missing):
#   ASC_KEY_ID, ASC_ISSUER_ID   from the environment. If they are not set and `zao-env`
#                               is on PATH, the script runs: eval "$(zao-env load asc)"
#                               (override the name with ASC_ENV_NAME).
#   the key file                ~/.zao/private/asc/AuthKey_<ASC_KEY_ID>.p8, or ASC_KEY_PATH.
#                               It must sit outside this repo. Its contents are never printed.
#   SPARKZ_TEAM_ID              Apple team; default AYJY22EEPG (Zaal's).
#   BUILD_NUMBER                optional: use this build number instead of the next one.
#   ALLOW_DIRTY=1               optional: skip the clean-tree preflight.
#   MIN_XCODE                   optional: lowest Xcode major version accepted; default 26.
#
# Build number: the next one is above both the local CURRENT_PROJECT_VERSION and the
# highest build App Store Connect already has for this app (read-only API calls with the
# key), so a stale checkout can never reuse a number. A dry run reads App Store Connect
# when the key is available and otherwise falls back to the local number with a warning.
#
# Preflight, before anything is built: Xcode version, a clean git tree, and
# ITSAppUsesNonExemptEncryption = NO in Info.plist (without it every build stops on the
# export compliance question). After npx cap sync ios, any change to tracked files under
# ios/ stops the run so it can be reviewed and committed first.
#
# Notes: -allowProvisioningUpdates may create or renew signing certificates and profiles,
# even on --dry-run. The key ID and issuer ID appear in the altool command line, so other
# local users can see them in `ps` while it runs; the key itself does not. A dry run does
# not need the key at all.
#
# The ios/ folder is generated on the Mac (docs/TESTFLIGHT.md), so run this from a
# checkout that has it. Build tooling only: it changes no app code.
set -euo pipefail
set +x # never trace: the key path and IDs stay out of logs by default

die() { echo "testflight: $*" >&2; exit 1; }
say() { echo "testflight: $*"; }
# One EXIT trap for everything: put the build number back unless an upload finished
# (restore), and remove the App Store Connect temp files (asc_cleanup). Both are defined
# below and are safe to run before they have anything to do.
on_exit() { if declare -F restore >/dev/null; then restore; fi; if declare -F asc_cleanup >/dev/null; then asc_cleanup; fi; }
trap on_exit EXIT

DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    -h|--help) sed -n '2,/^set -euo/p' "$0" | sed '$d'; exit 0 ;;
    *) die "unknown argument: $arg (use --dry-run or --help)" ;;
  esac
done

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
IOS="$ROOT/ios/App"
PBX="$IOS/App.xcodeproj/project.pbxproj"
[ -f "$PBX" ] || die "no $PBX. Generate ios/ first (docs/TESTFLIGHT.md, step 3)."

# Prefer a workspace when there is one (CocoaPods); this project uses Swift packages.
if [ -d "$IOS/App.xcworkspace" ]; then
  CONTAINER=(-workspace "$IOS/App.xcworkspace")
else
  CONTAINER=(-project "$IOS/App.xcodeproj")
fi
SCHEME="App"

for tool in npx xcodebuild xcrun git jq curl /usr/libexec/PlistBuddy; do
  command -v "$tool" >/dev/null || die "missing tool: $tool"
done

# --- preflight ---------------------------------------------------------------------
# awk reads all input: `| head -1` would SIGPIPE the writer and, under pipefail, end the run silently.
XV="$(xcodebuild -version 2>/dev/null | awk 'NR==1 {print $2}')"
[ "${XV%%.*}" -ge "${MIN_XCODE:-26}" ] 2>/dev/null \
  || die "Xcode ${XV:-unknown} is below ${MIN_XCODE:-26}; App Store Connect refuses uploads from old Xcode versions"
ENC="$(/usr/libexec/PlistBuddy -c 'Print :ITSAppUsesNonExemptEncryption' "$IOS/App/Info.plist" 2>/dev/null || true)"
[ "$ENC" = "false" ] \
  || die "Info.plist must set ITSAppUsesNonExemptEncryption to NO; found '${ENC:-missing}'"
if [ "${ALLOW_DIRTY:-0}" != 1 ]; then
  dirty="$(git -C "$ROOT" status --porcelain)"
  [ -z "$dirty" ] || die "uncommitted changes; commit them first or set ALLOW_DIRTY=1:
$dirty"
fi

# --- credentials (required to upload; used by a dry run when available) -----------
WANT_KEY=1
if [ "$DRY_RUN" = 1 ]; then
  WANT_KEY=0
  if [ -n "${ASC_KEY_ID:-}" ] || { command -v zao-env >/dev/null && zao-env show "${ASC_ENV_NAME:-asc}" >/dev/null 2>&1; }; then
    WANT_KEY=1
  fi
fi
if [ "$WANT_KEY" = 1 ]; then
if { [ -z "${ASC_KEY_ID:-}" ] || [ -z "${ASC_ISSUER_ID:-}" ]; } && command -v zao-env >/dev/null; then
  # Load first, then eval, so a missing env file stops here with its own message.
  asc_env="$(zao-env load "${ASC_ENV_NAME:-asc}")" \
    || die "zao-env load ${ASC_ENV_NAME:-asc} failed. Save the two IDs with: zao-env save ${ASC_ENV_NAME:-asc}"
  eval "$asc_env"
  unset asc_env
fi
[ -n "${ASC_KEY_ID:-}" ] || die "ASC_KEY_ID is not set (App Store Connect > Users and Access > Integrations > App Store Connect API)"
[ -n "${ASC_ISSUER_ID:-}" ] || die "ASC_ISSUER_ID is not set (shown above the key list on the same page)"

KEY="${ASC_KEY_PATH:-$HOME/.zao/private/asc/AuthKey_${ASC_KEY_ID}.p8}"
[ -f "$KEY" ] || die "API key file not found at the expected path (AuthKey_<ASC_KEY_ID>.p8 under ~/.zao/private/asc, or ASC_KEY_PATH)"
[ -r "$KEY" ] || die "API key file is not readable"
KEY_ABS="$(cd "$(dirname "$KEY")" && pwd)/$(basename "$KEY")"
case "$KEY_ABS" in
  "$ROOT"/*) die "the API key file is inside this repo. Move it to ~/.zao/private/asc/ so it can never be committed." ;;
esac
if [ -n "$(find "$KEY_ABS" -perm -004 2>/dev/null)" ]; then
  die "the API key file is world-readable. Run: chmod 600 on it."
fi
fi

TEAM="${SPARKZ_TEAM_ID:-AYJY22EEPG}"
SIGN=(-allowProvisioningUpdates) # the Xcode account signs; see the header

# --- sync --------------------------------------------------------------------
say "npx cap sync ios"
(cd "$ROOT" && npx cap sync ios)
if [ "${ALLOW_DIRTY:-0}" != 1 ]; then
  changed="$(git -C "$ROOT" status --porcelain -- ios)"
  [ -z "$changed" ] || die "npx cap sync ios changed tracked files; review and commit them, then rerun:
$changed"
fi

# --- build number --------------------------------------------------------------
PLIST_VER="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' "$IOS/App/Info.plist")"
[ "$PLIST_VER" = '$(CURRENT_PROJECT_VERSION)' ] \
  || die "Info.plist CFBundleVersion is '$PLIST_VER', expected \$(CURRENT_PROJECT_VERSION); this script bumps the project setting"

CURRENT="$(grep -oE 'CURRENT_PROJECT_VERSION = [0-9]+;' "$PBX" | grep -oE '[0-9]+' | sort -n | tail -1)"
[ -n "$CURRENT" ] || die "no CURRENT_PROJECT_VERSION in $PBX"
# Highest build number App Store Connect has for this app. Read-only GET calls; any API
# error stops the run rather than guessing.
ASC_MAX=""
# The token goes in a mode-600 header file, not on curl's command line, so `ps` never
# shows it. Both files live in a private mktemp directory removed by the EXIT trap.
ASC_TMP=""
asc_cleanup() {
  if [ -n "$ASC_TMP" ] && [ -d "$ASC_TMP" ]; then
    rm -f "$ASC_TMP/headers" "$ASC_TMP/body"
    rmdir "$ASC_TMP" 2>/dev/null || true
  fi
}
asc_get() { # asc_get <url> -> prints the HTTP code; the body lands in $ASC_TMP/body
  curl -sg -o "$ASC_TMP/body" -w '%{http_code}' -H @"$ASC_TMP/headers" "$1" || echo 000
}
asc_max_build() {
  local token code app bundle
  bundle="$(grep -oE 'PRODUCT_BUNDLE_IDENTIFIER = [^;]+;' "$PBX" | awk 'NR==1' | sed -E 's/.* = (.*);/\1/')"
  [ -n "$bundle" ] || die "no PRODUCT_BUNDLE_IDENTIFIER in $PBX"
  token="$(xcrun altool --generate-jwt --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER_ID" \
    --p8-file-path "$KEY_ABS" 2>&1 | grep -oE 'eyJ[A-Za-z0-9._-]+' | awk 'NR==1' || true)"
  [ -n "$token" ] || die "could not make an App Store Connect token (altool --generate-jwt)"
  ASC_TMP="$(mktemp -d)" || die "could not create a temp directory"
  (umask 077 && printf 'Authorization: Bearer %s\n' "$token" > "$ASC_TMP/headers")
  unset token
  code="$(asc_get "https://api.appstoreconnect.apple.com/v1/apps?filter[bundleId]=$bundle&fields[apps]=bundleId&limit=1")"
  [ "$code" = 200 ] || die "App Store Connect app lookup for $bundle returned HTTP $code"
  app="$(jq -r '.data[0].id // empty' "$ASC_TMP/body")" || die "could not read the App Store Connect app lookup"
  [ -n "$app" ] || die "App Store Connect has no app with bundle id $bundle"
  # Newest 200 uploads; the highest number is among them unless 200+ builds were uploaded
  # after it, which App Store Connect would refuse anyway (numbers must keep rising).
  code="$(asc_get "https://api.appstoreconnect.apple.com/v1/builds?filter[app]=$app&sort=-uploadedDate&limit=200&fields[builds]=version")"
  [ "$code" = 200 ] || die "App Store Connect builds lookup returned HTTP $code"
  ASC_MAX="$(jq -r '[.data[].attributes.version | tonumber? ] | max // 0' "$ASC_TMP/body")" \
    || die "could not read build numbers from App Store Connect"
  asc_cleanup
  [[ "$ASC_MAX" =~ ^[0-9]+$ ]] || die "could not read the highest build number from App Store Connect"
}
if [ "$WANT_KEY" = 1 ]; then
  asc_max_build
  say "App Store Connect: highest build so far is $ASC_MAX"
else
  ASC_MAX=0
  say "warning: dry run without the API key, so App Store Connect was not checked; using the local number"
fi
FLOOR=$(( CURRENT > ASC_MAX ? CURRENT : ASC_MAX ))
NEXT="${BUILD_NUMBER:-$((FLOOR + 1))}"
[[ "$NEXT" =~ ^[0-9]+$ ]] || die "BUILD_NUMBER must be a whole number, got '$NEXT'"
[ "$NEXT" -gt "$FLOOR" ] || die "build $NEXT is not above $FLOOR (local $CURRENT, App Store Connect $ASC_MAX); App Store Connect refuses a repeat"

cp "$PBX" "$PBX.testflight-bak"
# Put the old number back on any exit except a finished upload (a dry run, or a failure).
restore() { if [ -f "$PBX.testflight-bak" ]; then mv "$PBX.testflight-bak" "$PBX"; fi; }

sed -i '' -E "s/CURRENT_PROJECT_VERSION = [0-9]+;/CURRENT_PROJECT_VERSION = $NEXT;/" "$PBX"
VERSION="$(grep -oE 'MARKETING_VERSION = [^;]+;' "$PBX" | awk 'NR==1' | sed -E 's/MARKETING_VERSION = (.*);/\1/')"
say "version $VERSION, build $CURRENT -> $NEXT"

# --- archive -----------------------------------------------------------------
# A fresh directory for each run; nothing is ever deleted.
TMP="${TMPDIR:-/tmp}"
OUT="$(mktemp -d "${TMP%/}/sparkz-testflight-$NEXT.XXXXXX")" || die "could not create a temp directory"
ARCHIVE="$OUT/Sparkz.xcarchive"

say "xcodebuild archive -> $ARCHIVE"
xcodebuild "${CONTAINER[@]}" -scheme "$SCHEME" -configuration Release \
  -destination 'generic/platform=iOS' -archivePath "$ARCHIVE" \
  DEVELOPMENT_TEAM="$TEAM" CODE_SIGN_STYLE=Automatic \
  "${SIGN[@]}" archive > "$OUT/archive.log" 2>&1 \
  || { tail -30 "$OUT/archive.log" >&2; die "archive failed (full log: $OUT/archive.log)"; }

# --- export a signed .ipa ---------------------------------------------------------
cat > "$OUT/ExportOptions.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>method</key><string>app-store-connect</string>
<key>destination</key><string>export</string>
<key>teamID</key><string>$TEAM</string>
<key>signingStyle</key><string>automatic</string>
<key>testFlightInternalTestingOnly</key><true/>
<key>uploadSymbols</key><true/>
<key>manageAppVersionAndBuildNumber</key><false/>
</dict></plist>
PLIST

say "exporting a signed .ipa (Xcode account signs)"
xcodebuild -exportArchive -archivePath "$ARCHIVE" \
  -exportOptionsPlist "$OUT/ExportOptions.plist" -exportPath "$OUT/export" \
  "${SIGN[@]}" > "$OUT/export.log" 2>&1 \
  || { tail -30 "$OUT/export.log" >&2; die "export failed (full log: $OUT/export.log). If it names signing, check Xcode > Settings > Accounts is signed in to team $TEAM."; }
IPA="$(find "$OUT/export" -maxdepth 1 -name '*.ipa' | awk 'NR==1')"
[ -n "$IPA" ] || die "export finished but wrote no .ipa (log: $OUT/export.log)"

if [ "$DRY_RUN" = 1 ]; then
  say "DRY RUN OK: build $NEXT signed and exported to $IPA. Nothing uploaded; the build number is back at $CURRENT."
else
  # --- upload with the API key ---------------------------------------------------
  say "uploading with xcrun altool (API key)"
  xcrun altool --upload-app --type ios --file "$IPA" \
    --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER_ID" --p8-file-path "$KEY_ABS" \
    > "$OUT/upload.log" 2>&1 \
    || { tail -30 "$OUT/upload.log" >&2; die "upload failed (full log: $OUT/upload.log)"; }
  grep -qiE "UPLOAD SUCCEEDED|No errors uploading" "$OUT/upload.log" \
    || die "altool finished but reported no success line (log: $OUT/upload.log)"
  rm -f "$PBX.testflight-bak" # keep the new number
  say "UPLOADED: version $VERSION build $NEXT. Apple processes it for 10 to 30 minutes, then it shows in TestFlight."
  say "Commit the bumped build number: git add ios/App/App.xcodeproj/project.pbxproj"
fi
