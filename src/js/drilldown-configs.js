// ============================================================================
// DRILL-DOWN CHART CONFIGURATIONS
// ============================================================================
// These charts are loaded on-demand when navigating to specific views
// Access via URL hash: index.html#bankruptcies, index.html#exports, etc.

export const drilldownConfigs = {
    // === BANKRUPTCIES BY INDUSTRY (All 89 Industries) ===
    bankruptcies: [
        { id: 'bankruptcies-total-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-total.json', title: 'Total (All Industries)', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-01-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-01-crop-and-animal-production-hunting-and-related-service-activities.json', title: 'Agriculture & Hunting', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-03-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-03-fishing-and-aquaculture.json', title: 'Fishing & Aquaculture', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-06-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-06-extraction-of-crude-petroleum-and-natural-gas.json', title: 'Oil & Gas Extraction', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-09-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-09-mining-support-service-activities.json', title: 'Mining Support Services', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-10-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-10-manufacture-of-food-products.json', title: 'Food Manufacturing', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-31-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-31-manufacture-of-furniture.json', title: 'Furniture Manufacturing', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-41-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-41-construction-of-buildings.json', title: 'Construction of Buildings', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-42-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-42-civil-engineering.json', title: 'Civil Engineering', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-43-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-43-specialised-construction-activities.json', title: 'Specialized Construction', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-45-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-45-wholesale-and-retail-trade-and-repair-of-motor-vehicles-and-motorcycles.json', title: 'Auto Sales & Repair', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-46-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-46-wholesale-trade-except-of-motor-vehicles-and-motorcycles.json', title: 'Wholesale Trade', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-47-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-47-retail-trade-except-of-motor-vehicles-and-motorcycles.json', title: 'Retail Trade', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-49-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-49-land-transport-and-transport-via-pipelines.json', title: 'Land Transport', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-50-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-50-water-transport.json', title: 'Water Transport (Shipping)', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-55-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-55-accommodation.json', title: 'Accommodation (Hotels)', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-56-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-56-food-and-beverage-service-activities.json', title: 'Restaurants & Food Service', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-62-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-62-computer-programming.json', title: 'Computer Programming', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-68-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-68-real-estate-activities.json', title: 'Real Estate', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-69-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-69-legal-and-accounting-activities.json', title: 'Legal & Accounting', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-71-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-71-architectural-and-engineering-activities.json', title: 'Engineering & Architecture', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-73-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-73-advertising-and-market-research.json', title: 'Advertising & Marketing', subtitle: 'Number per quarter', type: 'line' },
        { id: 'bankruptcies-85-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-85-education.json', title: 'Education', subtitle: 'Number per quarter', type: 'line' },
    ],
    
    // === EXPORTS BY COUNTRY (All 257 Countries) - For future use ===
    exports: [
        // Will be populated if user wants export drill-down too
    ]
};

