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
#   BUILD_NUMBER                optional: use this build number instead of current + 1.
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

for tool in npx xcodebuild xcrun /usr/libexec/PlistBuddy; do
  command -v "$tool" >/dev/null || die "missing tool: $tool"
done

# --- credentials (upload only) ---------------------------------------------------
if [ "$DRY_RUN" = 0 ]; then
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

# --- build number --------------------------------------------------------------
PLIST_VER="$(/usr/libexec/PlistBuddy -c 'Print :CFBundleVersion' "$IOS/App/Info.plist")"
[ "$PLIST_VER" = '$(CURRENT_PROJECT_VERSION)' ] \
  || die "Info.plist CFBundleVersion is '$PLIST_VER', expected \$(CURRENT_PROJECT_VERSION); this script bumps the project setting"

CURRENT="$(grep -oE 'CURRENT_PROJECT_VERSION = [0-9]+;' "$PBX" | grep -oE '[0-9]+' | sort -n | tail -1)"
[ -n "$CURRENT" ] || die "no CURRENT_PROJECT_VERSION in $PBX"
NEXT="${BUILD_NUMBER:-$((CURRENT + 1))}"
[[ "$NEXT" =~ ^[0-9]+$ ]] || die "BUILD_NUMBER must be a whole number, got '$NEXT'"
[ "$NEXT" -gt "$CURRENT" ] || die "build $NEXT is not above the current $CURRENT; App Store Connect refuses a repeat"

cp "$PBX" "$PBX.testflight-bak"
# Put the old number back on any exit except a finished upload (a dry run, or a failure).
restore() { if [ -f "$PBX.testflight-bak" ]; then mv "$PBX.testflight-bak" "$PBX"; fi; }
trap restore EXIT

sed -i '' -E "s/CURRENT_PROJECT_VERSION = [0-9]+;/CURRENT_PROJECT_VERSION = $NEXT;/" "$PBX"
VERSION="$(grep -oE 'MARKETING_VERSION = [^;]+;' "$PBX" | head -1 | sed -E 's/MARKETING_VERSION = (.*);/\1/')"
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
IPA="$(find "$OUT/export" -maxdepth 1 -name '*.ipa' | head -1)"
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
