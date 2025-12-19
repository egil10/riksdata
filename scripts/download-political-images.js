/**
 * Download Political Timeline Images
 * 
 * This script downloads all PM photos and party logos from Wikimedia Commons
 * and saves them locally to improve loading performance.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const JSON_PATH = path.join(__dirname, '../data/static/political-timeline.json');
const PM_IMAGES_DIR = path.join(__dirname, '../assets/images/political/prime-ministers');
const PARTY_LOGOS_DIR = path.join(__dirname, '../assets/images/political/party-logos');

// Create directories if they don't exist
[PM_IMAGES_DIR, PARTY_LOGOS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    }
});

/**
 * Download a file from URL
 */
function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);

        const options = {
            headers: {
                'User-Agent': 'Riksdata/1.0 (https://riksdata.no; contact@riksdata.no) Node.js'
            }
        };

        https.get(url, options, (response) => {
            // Handle redirects
            if (response.statusCode === 301 || response.statusCode === 302) {
                downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { }); // Delete partial file
            reject(err);
        });
    });
}

/**
 * Get filename from URL
 */
function getFilenameFromUrl(url) {
    const urlParts = url.split('/');
    let filename = urlParts[urlParts.length - 1];
    // Decode URL encoding
    filename = decodeURIComponent(filename);
    // Remove query parameters
    filename = filename.split('?')[0];
    return filename;
}

/**
 * Sanitize filename for filesystem
 */
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_+/g, '_')
        .toLowerCase();
}

/**
 * Main function
 */
async function main() {
    console.log('🚀 Starting political timeline image download...\n');

    // Read JSON file
    const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

    const downloadedImages = new Set();
    const imageMapping = {
        primeMinisterImages: {},
        partyLogos: {}
    };

    // Download party logos
    console.log('📥 Downloading party logos...');
    for (const [partyCode, partyData] of Object.entries(data.parties)) {
        if (partyData.logoUrl && !downloadedImages.has(partyData.logoUrl)) {
            try {
                const originalFilename = getFilenameFromUrl(partyData.logoUrl);
                const ext = path.extname(originalFilename);
                const sanitized = sanitizeFilename(partyCode + ext);
                const filepath = path.join(PARTY_LOGOS_DIR, sanitized);

                await downloadFile(partyData.logoUrl, filepath);
                downloadedImages.add(partyData.logoUrl);
                imageMapping.partyLogos[partyCode] = `./assets/images/political/party-logos/${sanitized}`;

                console.log(`  ✅ ${partyData.name}: ${sanitized}`);
            } catch (error) {
                console.error(`  ❌ Failed to download ${partyData.name} logo:`, error.message);
            }
        }
    }

    // Download PM images
    console.log('\n📥 Downloading Prime Minister photos...');
    for (const government of data.governments) {
        if (government.imageUrl && !downloadedImages.has(government.imageUrl)) {
            try {
                const originalFilename = getFilenameFromUrl(government.imageUrl);
                const ext = path.extname(originalFilename);
                const pmName = government.primeMinister.replace(/\s+/g, '_').toLowerCase();
                const period = government.period.replace(/\s+/g, '_').toLowerCase();
                const sanitized = sanitizeFilename(`${pmName}_${period}${ext}`);
                const filepath = path.join(PM_IMAGES_DIR, sanitized);

                await downloadFile(government.imageUrl, filepath);
                downloadedImages.add(government.imageUrl);
                imageMapping.primeMinisterImages[government.imageUrl] = `./assets/images/political/prime-ministers/${sanitized}`;

                console.log(`  ✅ ${government.primeMinister} (${government.period}): ${sanitized}`);
            } catch (error) {
                console.error(`  ❌ Failed to download ${government.primeMinister} photo:`, error.message);
            }
        }
    }

    // Update JSON with local paths
    console.log('\n📝 Updating JSON with local image paths...');

    // Update party logos
    for (const [partyCode, partyData] of Object.entries(data.parties)) {
        if (imageMapping.partyLogos[partyCode]) {
            partyData.logoUrl = imageMapping.partyLogos[partyCode];
        }
    }

    // Update PM images
    for (const government of data.governments) {
        if (imageMapping.primeMinisterImages[government.imageUrl]) {
            government.imageUrl = imageMapping.primeMinisterImages[government.imageUrl];
        }
    }

    // Save updated JSON
    const outputPath = JSON_PATH;
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`✅ Updated JSON saved to: ${outputPath}`);

    // Print summary
    console.log('\n📊 Summary:');
    console.log(`  Party logos downloaded: ${Object.keys(imageMapping.partyLogos).length}`);
    console.log(`  PM photos downloaded: ${Object.keys(imageMapping.primeMinisterImages).length}`);
    console.log(`  Total images: ${downloadedImages.size}`);
    console.log('\n✨ Done! All images are now local.');
}

// Run the script
main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
});
