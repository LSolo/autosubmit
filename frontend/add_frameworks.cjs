const xcode = require('xcode');
const fs = require('fs');
const path = require('path');

const projectPath = 'ios/App/App.xcodeproj/project.pbxproj';
const myProj = xcode.project(projectPath);

myProj.parse(function (err) {
    if (err) {
        console.error('Error parsing project:', err);
        process.exit(1);
    }

    const libsDir = 'Libs';
    const frameworks = ['Capacitor.xcframework', 'Cordova.xcframework'];

    frameworks.forEach(fw => {
        const fullPath = path.join(libsDir, fw);
        
        console.log(`Adding ${fw}...`);
        
        // Remove existing references first to avoid duplicates
        myProj.removeFramework(fullPath, { customFramework: true, embed: true });
        
        // Add Framework
        // customFramework: true ensures it's treated as a file in the project, not a system framework
        // embed: true adds it to 'Embed Frameworks' build phase
        // sign: true ensures 'Code Sign on Copy' is checked
        myProj.addFramework(fullPath, { customFramework: true, embed: true, sign: true });
    });

    fs.writeFileSync(projectPath, myProj.writeSync());
    console.log('Frameworks added successfully.');
});
