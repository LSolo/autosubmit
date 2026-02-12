const fs = require('fs');

const paths = [
    'ios/App/Libs/Capacitor.xcframework/ios-arm64/Capacitor.framework/Modules/Capacitor.swiftmodule/arm64-apple-ios.private.swiftinterface',
    'ios/App/Libs/Capacitor.xcframework/ios-arm64/Capacitor.framework/Modules/Capacitor.swiftmodule/arm64-apple-ios.swiftinterface',
    'ios/App/Libs/Capacitor.xcframework/ios-arm64_x86_64-simulator/Capacitor.framework/Modules/Capacitor.swiftmodule/x86_64-apple-ios-simulator.private.swiftinterface',
    'ios/App/Libs/Capacitor.xcframework/ios-arm64_x86_64-simulator/Capacitor.framework/Modules/Capacitor.swiftmodule/arm64-apple-ios-simulator.swiftinterface',
    'ios/App/Libs/Capacitor.xcframework/ios-arm64_x86_64-simulator/Capacitor.framework/Modules/Capacitor.swiftmodule/arm64-apple-ios-simulator.private.swiftinterface',
    'ios/App/Libs/Capacitor.xcframework/ios-arm64_x86_64-simulator/Capacitor.framework/Modules/Capacitor.swiftmodule/x86_64-apple-ios-simulator.swiftinterface'
];

paths.forEach(path => {
    if (fs.existsSync(path)) {
        let content = fs.readFileSync(path, 'utf8');
        let modified = false;
        
        // Remove "-enable-experimental-feature DebugDescriptionMacro"
        if (content.includes('-enable-experimental-feature DebugDescriptionMacro')) {
            console.log('Patching DebugDescriptionMacro in', path);
            content = content.replace(/-enable-experimental-feature DebugDescriptionMacro/g, '');
            modified = true;
        }
        
        // Remove bare "-enable-experimental-feature" if it exists with other args
        // Regex to match -enable-experimental-feature followed by non-space
        // But simply removing the flag and its argument is safer.
        // Let's check for other occurrences.
        if (content.includes('-enable-experimental-feature')) {
             console.log('Still found -enable-experimental-feature in', path);
             // Try to remove it generically: "-enable-experimental-feature <Word>"
             content = content.replace(/-enable-experimental-feature \w+/g, '');
             modified = true;
        }

        // Patch NonescapableTypes check for older compilers
        if (content.includes('$NonescapableTypes')) {
            console.log('Patching NonescapableTypes in', path);
            // Replace "#if compiler(>=5.3) && $NonescapableTypes" with "#if true"
            // We use a regex to be safe about spacing
            content = content.replace(/#if compiler\(>=5\.3\) && \$NonescapableTypes/g, '#if true');
            modified = true;
        }

        if (modified) {
            content = content.replace(/  /g, ' ');
            fs.writeFileSync(path, content);
            console.log('Saved', path);
        } else {
            console.log('No changes needed for', path);
        }
    } else {
        console.log('File not found:', path);
    }
});
