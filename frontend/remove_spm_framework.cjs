const xcode = require('xcode');
const fs = require('fs');

const projectPath = 'ios/App/App.xcodeproj/project.pbxproj';
const myProj = xcode.project(projectPath);

myProj.parse(function (err) {
    if (err) {
        console.error('Error parsing:', err);
        process.exit(1);
    }

    const objects = myProj.hash.project.objects;
    const buildPhases = objects.PBXFrameworksBuildPhase;
    const buildFiles = objects.PBXBuildFile;
    const productDeps = objects.XCSwiftPackageProductDependency;

    let buildFileIdToRemove = null;

    // Find the build file that references CapApp-SPM
    for (const key in buildFiles) {
        if (!key.endsWith('_comment')) {
            const file = buildFiles[key];
            if (file.productRef && productDeps) {
                 const productRefId = file.productRef;
                 const productRef = productDeps[productRefId];
                 if (productRef && productRef.productName === 'CapApp-SPM') {
                     console.log('Found BuildFile to remove:', key);
                     buildFileIdToRemove = key;
                     break;
                 }
            }
            // Fallback: check comment if productRef lookup fails
            if (buildFiles[key + '_comment'] && buildFiles[key + '_comment'].includes('CapApp-SPM')) {
                console.log('Found BuildFile by comment:', key);
                buildFileIdToRemove = key;
                break;
            }
        }
    }
    
    if (buildFileIdToRemove) {
        // Remove from Frameworks Build Phase
        for (const key in buildPhases) {
            if (!key.endsWith('_comment')) {
                const phase = buildPhases[key];
                if (phase.files) {
                    // node-xcode parses files as array of objects { value: 'ID', comment: '...' }
                    const index = phase.files.findIndex(f => f.value === buildFileIdToRemove);
                    if (index !== -1) {
                        console.log('Removing from build phase:', key);
                        phase.files.splice(index, 1);
                    }
                }
            }
        }
        
        // Remove the BuildFile object itself
        delete buildFiles[buildFileIdToRemove];
        delete buildFiles[buildFileIdToRemove + '_comment'];
    } else {
        console.log('BuildFile for CapApp-SPM not found.');
    }

    fs.writeFileSync(projectPath, myProj.writeSync());
    console.log('Project updated.');
});
