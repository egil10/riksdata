// Simple script to check missing dataset mappings
const fs = require('fs');

// Read main.js and extract dataset IDs
const mainJs = fs.readFileSync('src/js/main.js', 'utf8');
const datasetMatches = mainJs.match(/dataset\/([0-9]+)/g);
const datasetIds = [...new Set(datasetMatches.map(match => match.split('/')[1]))];

// Read config.js and extract mapped dataset IDs
const configJs = fs.readFileSync('src/js/config.js', 'utf8');
const configMatches = configJs.match(/'([0-9]+)':/g);
const configIds = [...new Set(configMatches.map(match => match.match(/'([0-9]+)'/)[1]))];

// Find missing IDs
const missingIds = datasetIds.filter(id => !configIds.includes(id));

console.log('Dataset IDs in main.js:', datasetIds.length);
console.log('Dataset IDs in config.js:', configIds.length);
console.log('Missing dataset IDs:', missingIds);

if (missingIds.length > 0) {
    console.log('\nMissing mappings:');
    missingIds.forEach(id => {
        console.log(`'${id}': 'dataset-${id}',`);
    });
}
