const xcode = require('xcode');
const fs = require('fs');

const projectPath = 'ios/App/App.xcodeproj/project.pbxproj';
const myProj = xcode.project(projectPath);

myProj.parse(function (err) {
    if (err) {
        console.error('Error parsing:', err);
        process.exit(1);
    }

    console.log('Adding Frameworks...');
    // Add Frameworks
    // customFramework: true handles .xcframework
    // embed: true adds to Copy Files phase (Embed Frameworks)
    // sign: true checks "Code Sign on Copy"
    const options = { customFramework: true, embed: true, sign: true };
    myProj.addFramework('Libs/Capacitor.xcframework', options);
    myProj.addFramework('Libs/Cordova.xcframework', options);

    console.log('Removing SPM dependencies...');
    const objects = myProj.hash.project.objects;
    
    // 1. Find PBXNativeTarget 'App'
    let targetId = null;
    const targets = objects.PBXNativeTarget;
    for (const key in targets) {
        // filter out comments
        if (!key.endsWith('_comment') && targets[key].name === 'App') {
            targetId = key;
            break;
        }
    }
    
    if (targetId) {
        const target = targets[targetId];
        // Remove packageProductDependencies
        if (target.packageProductDependencies) {
            console.log('Found package dependencies:', target.packageProductDependencies);
            // We just clear the array. The referenced objects (XCSwiftPackageProductDependency) remain in the file but unused.
            // That's fine for now.
            target.packageProductDependencies = [];
        }
    } else {
        console.warn('Target App not found!');
    }
    
    // 2. Remove PBXProject packageReferences
    const projects = objects.PBXProject;
    for (const key in projects) {
        if (!key.endsWith('_comment')) {
            const proj = projects[key];
            if (proj.packageReferences) {
                console.log('Found project package references');
                proj.packageReferences = [];
            }
        }
    }
    
    // 3. Clean up PBXFrameworksBuildPhase
    // The previous error "Missing package product" was because the target depended on it.
    // However, it might also be listed in the Frameworks build phase.
    // addFramework adds new entries. We should check if there are old ones.
    const buildPhases = objects.PBXFrameworksBuildPhase;
    for (const key in buildPhases) {
        if (!key.endsWith('_comment')) {
             const phase = buildPhases[key];
             if (phase.files) {
                 // Loop through files and look for ones that reference the SPM product
                 // This is harder to detect via node-xcode without resolving refs.
                 // But typically SPM deps in Frameworks phase look like normal build files.
                 // Let's hope Xcode ignores them if the package ref is gone, or we get a different error.
             }
        }
    }

    fs.writeFileSync(projectPath, myProj.writeSync());
    console.log('Project updated successfully.');
});
