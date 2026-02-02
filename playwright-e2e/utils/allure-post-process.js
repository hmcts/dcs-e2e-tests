
import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

const allureResultsPath = './allure-results';

async function postProcessAllureResults() {
    try {
        const files = await readdir(allureResultsPath);

        for (const file of files) {
            if (file.endsWith('-result.json')) {
                const filePath = path.join(allureResultsPath, file);
                const content = await readFile(filePath, 'utf8');
                const result = JSON.parse(content);

                let modified = false;

                // Iterate through labels to find and modify project names
                if (result.labels) {
                    for (const label of result.labels) {
                        if (label.name === 'project' || label.name === 'suite' || label.name === 'parentSuite') {
                            if (label.value === 'notes-chrome') {
                                label.value = 'chrome';
                                modified = true;
                            } else if (label.value === 'notes-firefox') {
                                label.value = 'firefox';
                                modified = true;
                            }
                        }
                    }
                }

                // If any modification was made, write the updated JSON back
                if (modified) {
                    await writeFile(filePath, JSON.stringify(result, null, 2), 'utf8');
                    console.log(`Modified project name in ${file}`);
                }
            }
        }
        console.log('Allure results post-processing complete.');
    } catch (error) {
        console.error('Error during Allure results post-processing:', error);
        process.exit(1);
    }
}

postProcessAllureResults();
