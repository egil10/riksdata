// Diagnostic script for Riksklokken data sources
async function runDiagnostics() {
    console.log('🔍 Starting Riksklokken Diagnostics...\n');
    
    const dataSources = [
        { name: 'CPI', url: 'https://data.ssb.no/api/v0/dataset/1086.json?lang=en' },
        { name: 'Unemployment Rate', url: 'https://data.ssb.no/api/v0/dataset/1054.json?lang=en' },
        { name: 'House Price Index', url: 'https://data.ssb.no/api/v0/dataset/1060.json?lang=en' },
        { name: 'Producer Price Index', url: 'https://data.ssb.no/api/v0/dataset/26426.json?lang=en' },
        { name: 'Wage Index', url: 'https://data.ssb.no/api/v0/dataset/1124.json?lang=en' },
        { name: 'GDP Growth', url: 'https://data.ssb.no/api/v0/dataset/59012.json?lang=en' },
        { name: 'Trade Balance', url: 'https://data.ssb.no/api/v0/dataset/58962.json?lang=en' },
        { name: 'Bankruptcies', url: 'https://data.ssb.no/api/v0/dataset/95265.json?lang=en' },
        { name: 'Population Growth', url: 'https://data.ssb.no/api/v0/dataset/49626.json?lang=en' },
        { name: 'Construction Costs', url: 'https://data.ssb.no/api/v0/dataset/26944.json?lang=en' },
        { name: 'Exchange Rate', url: 'https://data.norges-bank.no/api/data/EXR/M.USD+EUR.NOK.SP?format=sdmx-json&startPeriod=2015-08-11&endPeriod=2025-08-01&locale=no' },
        { name: 'Interest Rate', url: 'https://data.norges-bank.no/api/data/IR/M.KPRA..?format=sdmx-json&startPeriod=2000-01-01&endPeriod=2025-08-01&locale=no' },
        { name: 'Government Debt', url: 'https://data.norges-bank.no/api/data/GOVT_KEYFIGURES/V_O+N_V+V_I+ATRI+V_IRS..B.GBON?endPeriod=2025-08-01&format=sdmx-json&locale=no&startPeriod=2000-01-01' }
    ];

    let passedTests = 0;
    let totalTests = dataSources.length;

    for (const source of dataSources) {
        try {
            console.log(`📊 Testing ${source.name}...`);
            
            const response = await fetch(source.url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Basic data validation
            if (!data) {
                throw new Error('No data received');
            }
            
            // Check for SSB data structure
            if (source.url.includes('ssb.no')) {
                if (!data.dataset || !data.dataset.dimension || !data.dataset.value) {
                    throw new Error('Invalid SSB data structure');
                }
                console.log(`   ✅ SSB data structure valid`);
                console.log(`   📈 Data points: ${data.dataset.value.length}`);
            }
            
            // Check for Norges Bank data structure
            if (source.url.includes('norges-bank.no')) {
                if (!data.data || !data.data.dataSets || !data.data.dataSets[0]) {
                    throw new Error('Invalid Norges Bank data structure');
                }
                console.log(`   ✅ Norges Bank data structure valid`);
                console.log(`   📈 Series count: ${Object.keys(data.data.dataSets[0].series).length}`);
            }
            
            console.log(`   ✅ ${source.name} - PASSED\n`);
            passedTests++;
            
        } catch (error) {
            console.log(`   ❌ ${source.name} - FAILED: ${error.message}\n`);
        }
    }

    // Test Oil Fund local data
    try {
        console.log(`📊 Testing Oil Fund (local data)...`);
        const response = await fetch('data/oil-fund.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (!data.data || !Array.isArray(data.data)) {
            throw new Error('Invalid oil fund data structure');
        }
        
        console.log(`   ✅ Oil Fund data structure valid`);
        console.log(`   📈 Data points: ${data.data.length}`);
        console.log(`   ✅ Oil Fund - PASSED\n`);
        passedTests++;
        totalTests++;
        
    } catch (error) {
        console.log(`   ❌ Oil Fund - FAILED: ${error.message}\n`);
        totalTests++;
    }

    // Summary
    console.log(`📋 DIAGNOSTIC SUMMARY:`);
    console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`   ❌ Failed: ${totalTests - passedTests}/${totalTests}`);
    console.log(`   📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
        console.log(`\n🎉 All data sources are working correctly!`);
    } else {
        console.log(`\n⚠️  Some data sources have issues. Check the failed tests above.`);
    }
    
    // Test political periods
    console.log(`\n🏛️  Testing Political Periods...`);
    const testDates = [
        new Date('2000-01-01'),
        new Date('2000-03-17'),
        new Date('2001-10-19'),
        new Date('2005-10-17'),
        new Date('2013-10-16'),
        new Date('2021-10-14'),
        new Date('2025-01-01')
    ];
    
    testDates.forEach(date => {
        const period = getPoliticalPeriod(date);
        if (period) {
            console.log(`   ✅ ${date.toISOString().split('T')[0]}: ${period.name}`);
        } else {
            console.log(`   ❌ ${date.toISOString().split('T')[0]}: No period found`);
        }
    });
    
    console.log(`\n🔍 Diagnostics complete!`);
}

// Run diagnostics when script is loaded
if (typeof window !== 'undefined') {
    window.runDiagnostics = runDiagnostics;
    console.log('🔍 Diagnostics script loaded. Run runDiagnostics() to test all data sources.');
}
