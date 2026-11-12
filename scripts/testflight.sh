#!/usr/bin/env bash
# Builds the Sparkz iPhone app and uploads it to TestFlight with no clicks in Xcode.
#
#   scripts/testflight.sh            sync, bump the build number, archive, upload
#   scripts/testflight.sh --dry-run  sync, bump, archive and export locally; stops before
#                                    the upload and puts the build number back
#
# Steps: npx cap sync ios; bump the build number (CFBundleVersion, which Info.plist takes
# from CURRENT_PROJECT_VERSION); xcodebuild archive; xcodebuild -exportArchive with an
# ExportOptions.plist whose method is app-store-connect and destination is upload.
# Signing and upload use an App Store Connect API key, so no Apple ID sign-in is needed.
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
    -h|--help) sed -n '2,24p' "$0"; exit 0 ;;
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

for tool in npx xcodebuild /usr/libexec/PlistBuddy; do
  command -v "$tool" >/dev/null || die "missing tool: $tool"
done

# --- credentials -------------------------------------------------------------
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

TEAM="${SPARKZ_TEAM_ID:-AYJY22EEPG}"
AUTH=(-allowProvisioningUpdates
  -authenticationKeyPath "$KEY_ABS"
  -authenticationKeyID "$ASC_KEY_ID"
  -authenticationKeyIssuerID "$ASC_ISSUER_ID")

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
TMP="${TMPDIR:-/tmp}"; OUT="${TMP%/}/sparkz-testflight/$NEXT"
rm -rf "$OUT" && mkdir -p "$OUT"
ARCHIVE="$OUT/Sparkz.xcarchive"

say "xcodebuild archive -> $ARCHIVE"
xcodebuild "${CONTAINER[@]}" -scheme "$SCHEME" -configuration Release \
  -destination 'generic/platform=iOS' -archivePath "$ARCHIVE" \
  DEVELOPMENT_TEAM="$TEAM" CODE_SIGN_STYLE=Automatic \
  "${AUTH[@]}" archive > "$OUT/archive.log" 2>&1 \
  || { tail -30 "$OUT/archive.log" >&2; die "archive failed (full log: $OUT/archive.log)"; }

# --- export and upload ----------------------------------------------------------
DEST=upload
[ "$DRY_RUN" = 1 ] && DEST=export
cat > "$OUT/ExportOptions.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>method</key><string>app-store-connect</string>
<key>destination</key><string>$DEST</string>
<key>teamID</key><string>$TEAM</string>
<key>signingStyle</key><string>automatic</string>
<key>testFlightInternalTestingOnly</key><true/>
<key>uploadSymbols</key><true/>
<key>manageAppVersionAndBuildNumber</key><false/>
</dict></plist>
PLIST

if [ "$DRY_RUN" = 1 ]; then
  say "dry run: exporting the signed .ipa locally, no upload"
else
  say "exporting and uploading to App Store Connect"
fi
xcodebuild -exportArchive -archivePath "$ARCHIVE" \
  -exportOptionsPlist "$OUT/ExportOptions.plist" -exportPath "$OUT/export" \
  "${AUTH[@]}" > "$OUT/export.log" 2>&1 \
  || { tail -30 "$OUT/export.log" >&2; die "export failed (full log: $OUT/export.log)"; }

if [ "$DRY_RUN" = 1 ]; then
  say "DRY RUN OK: build $NEXT archived and exported to $OUT/export. Nothing uploaded; the build number is back at $CURRENT."
else
  grep -q "Upload succeeded" "$OUT/export.log" || die "export finished but no 'Upload succeeded' line (log: $OUT/export.log)"
  rm -f "$PBX.testflight-bak" # keep the new number
  say "UPLOADED: version $VERSION build $NEXT. Apple processes it for 10 to 30 minutes, then it shows in TestFlight."
  say "Commit the bumped build number: git add ios/App/App.xcodeproj/project.pbxproj"
fi
