#!/bin/bash
set -e

# Configuration
PROJECT_PATH="ios/App/App.xcodeproj"
SCHEME="App"
RELEASE_DIR="release"
SIMULATOR_DIR="$RELEASE_DIR/simulator"
OUTPUT_DIR="ios/output"
LIBS_DIR="ios/App/Libs"
LOCAL_CAP_DIR="local-cap"

echo "🚀 Starting iOS Release Build Process..."

# 0. Ensure Release Directory Exists
mkdir -p "$RELEASE_DIR"
mkdir -p "$OUTPUT_DIR"
mkdir -p "$SIMULATOR_DIR"

# 1. Frontend Build
echo "📦 Building Frontend..."
npm run build

# 2. Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync ios

# 3. Ensure Frameworks are in place
echo "🧩 Checking Frameworks..."
if [ ! -d "$LIBS_DIR" ]; then
    mkdir -p "$LIBS_DIR"
fi

# Check if we need to download/copy frameworks
if [ ! -d "$LIBS_DIR/Capacitor.xcframework" ]; then
    echo "⬇️  Restoring Capacitor Frameworks..."
    # If we have them in local-cap, copy them. Otherwise download.
    if [ -d "$LOCAL_CAP_DIR/Capacitor.xcframework" ]; then
        cp -R "$LOCAL_CAP_DIR/Capacitor.xcframework" "$LIBS_DIR/"
        cp -R "$LOCAL_CAP_DIR/Cordova.xcframework" "$LIBS_DIR/"
    else
        echo "⚠️  Frameworks missing! Please ensure local-cap has frameworks or run npm install again."
        exit 1
    fi
fi

# 4. Patch Swift Interface (Crucial for Xcode 14 / Swift 5.7)
echo "🩹 Patching Swift Interface files..."
node patch_swiftinterface.cjs

# 5. Clean Project Dependencies (Remove SPM references)
echo "🧹 Cleaning Xcode Project dependencies..."
node remove_spm_framework.cjs

# 6. Add Manual Frameworks (Embed & Sign)
echo "🔗 Linking Frameworks..."
node add_frameworks.cjs

# 5. Build for Simulator (x86_64/arm64)
echo "🏗️ Building for Simulator..."
xcodebuild -project ios/App/App.xcodeproj \
           -scheme App \
           -configuration Release \
           -sdk iphonesimulator \
           -derivedDataPath output \
           CODE_SIGN_IDENTITY="" \
           CODE_SIGNING_REQUIRED=NO \
           CODE_SIGNING_ALLOWED=NO

# 6. Create Payload Structure
echo "📦 Packaging IPA..."
rm -rf release/simulator
mkdir -p release/simulator/Payload
cp -R "output/Build/Products/Release-iphonesimulator/App.app" release/simulator/Payload/
mv release/simulator/Payload/App.app release/simulator/App.app # Keep it at top level for manual install

# 7. Manually Embed Frameworks (Fix for Simulator Crash)
echo "🔧 Embedding Frameworks..."
FRAMEWORKS_DIR="release/simulator/App.app/Frameworks"
mkdir -p "$FRAMEWORKS_DIR"

# Copy from the Simulator slice
cp -R "ios/App/Libs/Capacitor.xcframework/ios-arm64_x86_64-simulator/Capacitor.framework" "$FRAMEWORKS_DIR/"
cp -R "ios/App/Libs/Cordova.xcframework/ios-arm64_x86_64-simulator/Cordova.framework" "$FRAMEWORKS_DIR/"

# Remove nested signatures to avoid conflicts
rm -rf "$FRAMEWORKS_DIR/Capacitor.framework/_CodeSignature"
rm -rf "$FRAMEWORKS_DIR/Cordova.framework/_CodeSignature"

# Sign Frameworks (Ad-Hoc)
codesign --force --sign "-" --timestamp=none "$FRAMEWORKS_DIR/Capacitor.framework"
codesign --force --sign "-" --timestamp=none "$FRAMEWORKS_DIR/Cordova.framework"

# Re-sign the main App binary and bundle
echo "✍️ Signing App..."
codesign --force --sign "-" --timestamp=none --deep "release/simulator/App.app"

# 8. Create ZIP (Simulator Build)
cd release/simulator
zip -r ../AutoSubmit-Simulator.zip App.app
cd ../..

echo "✅ Simulator Build Ready: release/AutoSubmit-Simulator.zip"

# 9. Install to Simulator
echo "📲 Installing to Simulator..."
xcrun simctl install booted release/simulator/App.app
echo "✅ Installed to Booted Simulator"
echo "🚀 Launching App..."
xcrun simctl launch booted com.autosubmit.app

# 7. Archive for Device (Unsigned/Ad-Hoc IPA)
echo "📱 Archiving for iOS Device (Unsigned)..."
xcodebuild archive \
    -project "$PROJECT_PATH" \
    -scheme "$SCHEME" \
    -archivePath ios/App.xcarchive \
    -sdk iphoneos \
    CODE_SIGNING_ALLOWED=NO \
    -quiet

echo "📦 Packaging IPA..."
# Create Payload structure
rm -rf "$OUTPUT_DIR/Payload"
mkdir -p "$OUTPUT_DIR/Payload"
cp -R ios/App.xcarchive/Products/Applications/App.app "$OUTPUT_DIR/Payload/"

# Zip it
cd "$OUTPUT_DIR"
zip -r -q App.ipa Payload
cd ../..

# Move to release
cp "$OUTPUT_DIR/App.ipa" "$RELEASE_DIR/AutoSubmit.ipa"

echo "✅ Build Complete!"
echo "---------------------------------------------------"
echo "📂 Output Files:"
echo "   - IPA (For Devices):     $RELEASE_DIR/AutoSubmit.ipa"
echo "   - Simulator App (Zip):   $RELEASE_DIR/AutoSubmit-Simulator.zip"
echo "---------------------------------------------------"
echo "ℹ️  To install on Simulator:"
echo "   1. Unzip AutoSubmit-Simulator.zip"
echo "   2. Run: xcrun simctl install booted release/simulator/App.app"
echo "   (Ensure a simulator is booted)"
