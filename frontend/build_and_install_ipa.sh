#!/bin/bash
set -e

# Configuration
APP_NAME="App"
SCHEME="App"
PROJECT_PATH="ios/App/App.xcodeproj"
ARCHIVE_PATH="ios/App.xcarchive"
EXPORT_PATH="ios/export"
PLIST_PATH="ios/App/App/Info.plist"
LOCAL_CAP_DIR="local-cap"
CAP_SPM_DIR="ios/App/CapApp-SPM"
PACKAGE_SWIFT="$CAP_SPM_DIR/Package.swift"

echo "🚀 Starting iOS Release Build Process..."

# 0. Ensure Local Capacitor Binaries Exist (Sandbox Workaround)
echo "🛠️ Checking local Capacitor binaries..."
if [ ! -d "$LOCAL_CAP_DIR" ]; then
    mkdir -p "$LOCAL_CAP_DIR"
fi

if [ ! -d "$LOCAL_CAP_DIR/Capacitor.xcframework" ] || [ ! -d "$LOCAL_CAP_DIR/Cordova.xcframework" ]; then
    echo "⬇️ Downloading Capacitor binaries (v8.0.2)..."
    curl -L -o "$LOCAL_CAP_DIR/Capacitor.xcframework.zip" "https://github.com/ionic-team/capacitor-swift-pm/releases/download/8.0.2/Capacitor.xcframework.zip"
    curl -L -o "$LOCAL_CAP_DIR/Cordova.xcframework.zip" "https://github.com/ionic-team/capacitor-swift-pm/releases/download/8.0.2/Cordova.xcframework.zip"
    
    echo "📦 Unzipping binaries..."
    unzip -q -o "$LOCAL_CAP_DIR/Capacitor.xcframework.zip" -d "$LOCAL_CAP_DIR"
    unzip -q -o "$LOCAL_CAP_DIR/Cordova.xcframework.zip" -d "$LOCAL_CAP_DIR"
    rm "$LOCAL_CAP_DIR/Capacitor.xcframework.zip" "$LOCAL_CAP_DIR/Cordova.xcframework.zip"
fi

# 1. Frontend Build
echo "📦 Building Frontend..."
npm run build

# 2. Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync ios

# 3. Embed Frameworks & Rewrite Package.swift
echo "🧩 Embedding Frameworks into CapApp-SPM..."
cp -R "$LOCAL_CAP_DIR/Capacitor.xcframework" "$CAP_SPM_DIR/"
cp -R "$LOCAL_CAP_DIR/Cordova.xcframework" "$CAP_SPM_DIR/"

echo "📝 Rewriting CapApp-SPM/Package.swift for direct embedding..."
cat <<EOF > "$PACKAGE_SWIFT"
// swift-tools-version: 5.7
import PackageDescription

let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v13)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                "Capacitor",
                "Cordova"
            ]
        ),
        .binaryTarget(
            name: "Capacitor",
            path: "Capacitor.xcframework"
        ),
        .binaryTarget(
            name: "Cordova",
            path: "Cordova.xcframework"
        )
    ]
)
EOF

# 4. Patch project.pbxproj for Ad-Hoc/Manual Signing
echo "🩹 Patching project.pbxproj for Manual Signing..."
# Change Automatic to Manual
sed -i '' 's/CODE_SIGN_STYLE = Automatic;/CODE_SIGN_STYLE = Manual;/g' "$PROJECT_PATH/project.pbxproj"
# Set Identity to Ad Hoc (-)
sed -i '' 's/CODE_SIGN_IDENTITY = "iPhone Developer";/CODE_SIGN_IDENTITY = "-";/g' "$PROJECT_PATH/project.pbxproj"
sed -i '' 's/"CODE_SIGN_IDENTITY\[sdk=iphoneos\*\]" = "iPhone Developer";/"CODE_SIGN_IDENTITY[sdk=iphoneos*]" = "-";/g' "$PROJECT_PATH/project.pbxproj"
# Remove Development Team
sed -i '' 's/DEVELOPMENT_TEAM = [A-Z0-9]*;/DEVELOPMENT_TEAM = "";/g' "$PROJECT_PATH/project.pbxproj"

# 5. Resolve Packages & Clean
echo "🧹 Resolving Packages & Cleaning..."
rm -rf "$ARCHIVE_PATH" "$EXPORT_PATH"

# Pre-resolve to ensure manifest is valid
echo "📦 Pre-resolving Swift Packages..."
pushd "$CAP_SPM_DIR" > /dev/null
swift package resolve --disable-sandbox
popd > /dev/null

xcodebuild clean -project "$PROJECT_PATH" -scheme "$SCHEME" -quiet

# 6. Archive the Project (Unsigned/Ad-Hoc)
echo "🏗️ Archiving Project..."
# We use CODE_SIGNING_REQUIRED=NO to allow build without valid certs if necessary
xcodebuild archive \
  -project "$PROJECT_PATH" \
  -scheme "$SCHEME" \
  -destination "generic/platform=iOS" \
  -archivePath "$ARCHIVE_PATH" \
  CODE_SIGN_IDENTITY="-" \
  CODE_SIGNING_REQUIRED="NO" \
  CODE_SIGNING_ALLOWED="NO" \
  AD_HOC_CODE_SIGNING_ALLOWED="YES"

# 7. Manual IPA Export (Payload Method)
echo "📦 Creating IPA manually..."
mkdir -p "$EXPORT_PATH/Payload"
# Copy the .app from the archive to the Payload directory
cp -R "$ARCHIVE_PATH/Products/Applications/$APP_NAME.app" "$EXPORT_PATH/Payload/"
# Zip it into an IPA
cd "$EXPORT_PATH"
zip -qr "$APP_NAME.ipa" Payload
rm -rf Payload
cd - > /dev/null

echo "✅ IPA generated at: $EXPORT_PATH/$APP_NAME.ipa"

# 8. Install on Device (if requested)
if command -v ideviceinstaller &> /dev/null; then
    echo "📱 Installing on connected device..."
    # Note: Installation might fail if the device is not jailbroken or provisioned for ad-hoc
    if ideviceinstaller -i "$EXPORT_PATH/$APP_NAME.ipa"; then
        echo "✅ App installed successfully!"
    else
        echo "❌ Installation failed. This is likely due to missing valid code signing."
        echo "👉 Since we used Ad-Hoc/No Signing, you might need to sign it manually or use a Jailbroken device/Simulator."
    fi
else
    echo "⚠️ 'ideviceinstaller' not found."
    echo "👉 To install, drag '$EXPORT_PATH/$APP_NAME.ipa' into Xcode Devices window."
fi

echo "🎉 Build Process Complete!"
