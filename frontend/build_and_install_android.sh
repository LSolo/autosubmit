#!/bin/bash
set -e

# Configuration
ANDROID_DIR="android"
RELEASE_DIR="release"
OUTPUT_DIR="android/app/build/outputs"

echo "🚀 Starting Android Build Process..."

# 0. Ensure Release Directory Exists
mkdir -p "$RELEASE_DIR"

# 1. Frontend Build
echo "📦 Building Frontend..."
npm run build

# 2. Sync Capacitor
echo "🔄 Syncing Capacitor Android..."
npx cap sync android

# 3. Build Android APK & Bundle
echo "🤖 Building Android App..."
cd "$ANDROID_DIR"

# Check for Java
if ! command -v java &> /dev/null; then
    echo "❌ Java not found! Android build requires a JDK."
    echo "   Please install Android Studio or a JDK (v11/v17)."
    echo "   Skipping Android compilation..."
    exit 0
fi

# Ensure gradlew is executable
chmod +x gradlew

# Build Debug APK (for local testing)
echo "   - Building Debug APK..."
if ./gradlew assembleDebug; then
    echo "   ✅ Debug Build Success"
else
    echo "   ❌ Debug Build Failed (Missing SDK?)"
    echo "   Please open 'android' folder in Android Studio to install SDKs."
    exit 0
fi

# Build Release Bundle (AAB for Play Store)
echo "   - Building Release Bundle (AAB)..."
./gradlew bundleRelease

cd ..

# 4. Move Artifacts
echo "🚚 Moving Artifacts to Release Folder..."

# Move Debug APK
if [ -f "$OUTPUT_DIR/apk/debug/app-debug.apk" ]; then
    cp "$OUTPUT_DIR/apk/debug/app-debug.apk" "$RELEASE_DIR/AutoSubmit-Debug.apk"
    echo "   ✅ Debug APK: $RELEASE_DIR/AutoSubmit-Debug.apk"
else
    echo "   ⚠️ Debug APK not found!"
fi

# Move Release AAB
if [ -f "$OUTPUT_DIR/bundle/release/app-release.aab" ]; then
    cp "$OUTPUT_DIR/bundle/release/app-release.aab" "$RELEASE_DIR/AutoSubmit-Release.aab"
    echo "   ✅ Release AAB: $RELEASE_DIR/AutoSubmit-Release.aab"
else
    echo "   ⚠️ Release AAB not found!"
fi

echo "✅ Android Build Complete!"
echo "---------------------------------------------------"
echo "📂 Output Files:"
echo "   - APK (Local Install):   $RELEASE_DIR/AutoSubmit-Debug.apk"
echo "   - AAB (Play Store):      $RELEASE_DIR/AutoSubmit-Release.aab"
echo "---------------------------------------------------"
