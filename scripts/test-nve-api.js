// Test script for NVE API endpoints
const BASE = 'https://biapi.nve.no/magasinstatistikk';

async function testNVEAPI() {
    console.log('Testing NVE API endpoints...\n');
    
    try {
        // Test 1: Fetch areas
        console.log('1. Testing /api/Magasinstatistikk/HentOmråder');
        const areasResponse = await fetch(`${BASE}/api/Magasinstatistikk/HentOmråder`);
        const areas = await areasResponse.json();
        console.log('Areas found:', areas.length);
        areas.forEach(area => console.log(`  - ${area.areaId}: ${area.areaName}`));
        
        // Test 2: Fetch all series (limit to recent data)
        console.log('\n2. Testing /api/Magasinstatistikk/HentOffentligData');
        const allDataResponse = await fetch(`${BASE}/api/Magasinstatistikk/HentOffentligData`);
        const allData = await allDataResponse.json();
        console.log('Total data points:', allData.length);
        
        // Show sample data
        if (allData.length > 0) {
            const sample = allData[0];
            console.log('Sample data point:', {
                area: sample.omrade,
                year: sample.iso_aar,
                week: sample.iso_uke,
                fillPct: sample.fyllingsgrad,
                capacityTWh: sample.kapasitet_TWh
            });
        }
        
        // Test 3: Fetch min/max/median
        console.log('\n3. Testing /api/Magasinstatistikk/HentOffentligDataMinMaxMedian');
        const statsResponse = await fetch(`${BASE}/api/Magasinstatistikk/HentOffentligDataMinMaxMedian`);
        const stats = await statsResponse.json();
        console.log('Statistical data points:', stats.length);
        
        // Show sample stats
        if (stats.length > 0) {
            const sample = stats[0];
            console.log('Sample stats:', {
                area: sample.omrade,
                week: sample.uke,
                min: sample.min,
                max: sample.max,
                median: sample.median
            });
        }
        
        console.log('\n✅ All NVE API endpoints are working correctly!');
        
    } catch (error) {
        console.error('❌ Error testing NVE API:', error);
    }
}

// Run the test
testNVEAPI();
