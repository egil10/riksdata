# 📊 Drilldown Dashboard Pipeline Guide

## Overview

This guide explains the complete pipeline for creating main dashboard cards with drilldown functionality, from raw JSON data to interactive dashboards.

## 🎯 Current Working Examples

We have successfully implemented drilldown dashboards for:
- **Bankruptcies** → By Industry (89 industries)
- **Exports** → By Country (multiple countries)
- **Imports** → By Country (multiple countries)  
- **CPI** → By Variation (multiple CPI types)
- **Vaccinations** → By Age Group (multiple age groups)
- **DFO** → By Department (multiple government departments)
- **Oil Fund** → By Asset Class (multiple asset classes)

## 📋 Complete Pipeline Steps

### Step 1: Prepare JSON Data Files
```
data/cached/ssb/[category]/
├── [category]-total.json                    # Main aggregated chart
├── [category]-[subcategory-1].json          # Individual drilldown charts
├── [category]-[subcategory-2].json
└── ...
```

**Example Structure:**
```json
{
  "metadata": {
    "source": "SSB",
    "dataset": "Dataset Name",
    "description": "Description of the data",
    "unit": "Number/Percentage/etc",
    "last_updated": "2024-01-01"
  },
  "data": [
    {
      "period": "2024K1",
      "value": 1234
    }
  ]
}
```

### Step 2: Add Main Chart to Dashboard
**File:** `src/js/chart-configs.js`

Add the main aggregated chart to the main dashboard:
```javascript
{ 
  id: 'bankruptcies-chart', 
  url: './data/cached/ssb/bankruptcies-total.json', 
  title: 'Bankruptcies', 
  subtitle: 'Number per quarter' 
}
```

### Step 3: Create Drilldown Configurations
**File:** `src/js/drilldown-configs.js`

Add a new section to `drilldownConfigs`:
```javascript
export const drilldownConfigs = {
  // Add your new category
  yourCategory: [
    { id: 'your-category-total-drilldown', url: './data/cached/ssb/your-category/your-category-total.json', title: 'Total', subtitle: 'Unit', type: 'line' },
    { id: 'your-category-1-drilldown', url: './data/cached/ssb/your-category/your-category-1.json', title: 'Subcategory 1', subtitle: 'Unit', type: 'line' },
    { id: 'your-category-2-drilldown', url: './data/cached/ssb/your-category/your-category-2.json', title: 'Subcategory 2', subtitle: 'Unit', type: 'line' },
    // ... more subcategories
  ]
};
```

### Step 4: Add Drilldown Loader Function
**File:** `src/js/drilldown.js`

Add a loader function following the existing pattern:
```javascript
/**
 * Load all your-category charts
 */
async function loadYourCategoryCharts() {
    const chartsContainer = document.getElementById('drilldown-charts-container');
    if (!chartsContainer) return;
    
    // Clear existing charts
    chartsContainer.innerHTML = '';
    
    const configs = drilldownConfigs.yourCategory;
    console.log(`📊 Loading ${configs.length} your-category charts in drill-down view...`);
    
    // Create chart cards for each subcategory
    for (const config of configs) {
        const chartCard = createChartCard(config, { name: 'SSB', url: 'https://www.ssb.no/' });
        chartsContainer.appendChild(chartCard);
    }
    
    // Now load all charts
    console.log('✅ Chart cards created, loading data...');
    
    for (const config of configs) {
        try {
            await loadChartData(config.id, config.url, config.title, config.type || 'line');
        } catch (error) {
            console.error(`Failed to load ${config.title}:`, error);
        }
    }
    
    console.log('✅ All your-category charts loaded in drill-down view!');
}
```

### Step 5: Add Hash Route Handler
**File:** `src/js/drilldown.js`

In the `handleHashChange()` function, add your new route:
```javascript
function handleHashChange() {
    const hash = window.location.hash.slice(1);
    console.log(`📍 Hash changed to: ${hash || '(empty)'}`);
    
    clearSearchFilter(); // Clear search filter on any hash change
    
    if (hash === 'yourCategory') {
        showYourCategoryView();
    }
    // ... existing routes
}
```

### Step 6: Add View Function
**File:** `src/js/drilldown.js`

Add a view function following the existing pattern:
```javascript
function showYourCategoryView() {
    console.log('🎯 Showing Your Category drill-down view...');
    
    // Hide main dashboard
    const mainDashboard = document.getElementById('main-dashboard');
    const drilldownView = document.getElementById('drilldown-view');
    
    if (mainDashboard) mainDashboard.style.display = 'none';
    if (drilldownView) drilldownView.style.display = 'block';
    
    // Update header breadcrumb
    updateHeaderBreadcrumb('Your Category');
    
    // Load charts
    loadYourCategoryCharts();
}
```

### Step 7: Add Drilldown Button Function
**File:** `src/js/drilldown.js`

Add a function to make your main chart clickable:
```javascript
function addYourCategoryDrilldownButton() {
    // Wait for DOM to be ready
    setTimeout(() => {
        const yourCategoryCard = document.querySelector('[data-chart-id="your-category-chart"]');
        if (!yourCategoryCard) {
            console.warn('Your category chart card not found, will retry...');
            setTimeout(addYourCategoryDrilldownButton, 1000);
            return;
        }
        
        console.log('✅ Found your category chart card, adding drill-down features...');
        
        // 1. Add drilldown icon button
        const chartActions = yourCategoryCard.querySelector('.chart-actions');
        if (chartActions && !chartActions.querySelector('[data-action="drilldown-your-category"]')) {
            const drilldownBtn = document.createElement('button');
            drilldownBtn.className = 'icon-btn';
            drilldownBtn.setAttribute('data-action', 'drilldown-your-category');
            drilldownBtn.setAttribute('aria-label', 'View by subcategory');
            drilldownBtn.setAttribute('title', 'View by subcategory');
            drilldownBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v16a2 2 0 0 0 2 2h16"></path>
                    <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
            `;
            drilldownBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.hash = 'yourCategory';
            };
            
            // Insert as first button
            chartActions.insertBefore(drilldownBtn, chartActions.firstChild);
            console.log('✅ Added drill-down icon button!');
        }
        
        // 2. Make title clickable
        const chartTitle = yourCategoryCard.querySelector('.chart-header h3');
        if (chartTitle && !chartTitle.hasAttribute('data-drilldown-enabled')) {
            chartTitle.style.cursor = 'pointer';
            chartTitle.setAttribute('data-drilldown-enabled', 'true');
            chartTitle.onclick = () => {
                window.location.hash = 'yourCategory';
            };
            chartTitle.setAttribute('title', 'Click to view by subcategory');
            console.log('✅ Made title clickable!');
        }
        
        console.log('✅ Drill-down features added successfully!');
    }, 3000); // Wait 3 seconds for charts to load
}
```

### Step 8: Initialize Drilldown Button
**File:** `src/js/drilldown.js`

In the `initDrilldownNavigation()` function, add your button initializer:
```javascript
export function initDrilldownNavigation() {
    console.log('🔍 Initializing drill-down navigation...');
    
    // Handle initial hash
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Add drill-down buttons to charts
    addDrilldownButton();
    addExportsDrilldownButton();
    addCPIDrilldownButton();
    addImportsDrilldownButton();
    addVaccinationsDrilldownButton();
    addDFODrilldownButton();
    addOilFundDrilldownButton();
    addYourCategoryDrilldownButton(); // Add your new button
}
```

## 🎯 Key Features

### Main Dashboard Card
- **Clickable title** - Click to navigate to drilldown
- **Drilldown button** - Chart icon button for drilldown
- **Standard actions** - Copy, download, fullscreen

### Drilldown View
- **Breadcrumb navigation** - "Riksdata → Your Category"
- **All subcategory charts** - Individual charts for each subcategory
- **Search functionality** - Search within drilldown charts
- **Sort functionality** - A-Z/Z-A sorting within drilldown
- **Back navigation** - Click "Riksdata" to return to main dashboard

### URL Navigation
- **Hash-based routing** - `index.html#yourCategory`
- **Bookmarkable URLs** - Users can bookmark specific drilldown views
- **Browser history** - Back/forward buttons work

## 📁 File Structure

```
src/js/
├── chart-configs.js          # Main dashboard charts
├── drilldown-configs.js      # Drilldown chart configurations
├── drilldown.js             # Drilldown navigation and logic
├── main.js                  # Main dashboard logic
└── charts.js                # Chart rendering logic

data/cached/ssb/
└── [category]/
    ├── [category]-total.json
    ├── [category]-[sub1].json
    ├── [category]-[sub2].json
    └── ...
```

## 🚀 Quick Start Template

To create a new drilldown dashboard:

1. **Create JSON files** in `data/cached/ssb/your-category/`
2. **Add main chart** to `chart-configs.js`
3. **Add drilldown config** to `drilldown-configs.js`
4. **Add loader function** to `drilldown.js`
5. **Add route handler** to `drilldown.js`
6. **Add view function** to `drilldown.js`
7. **Add drilldown button** to `drilldown.js`
8. **Initialize button** in `initDrilldownNavigation()`

## ✅ Success Criteria

Your drilldown dashboard is working when:
- ✅ Main chart appears on dashboard
- ✅ Main chart has drilldown button and clickable title
- ✅ Clicking navigates to `#yourCategory`
- ✅ Drilldown view shows all subcategory charts
- ✅ Breadcrumb navigation works
- ✅ Search works within drilldown
- ✅ Back to main dashboard works
- ✅ All charts load and display data correctly

## 🎨 Customization Options

- **Chart types** - Line, bar, area, etc.
- **Source attribution** - SSB, DFO, Norges Bank, etc.
- **Styling** - Colors, fonts, layouts
- **Interactions** - Hover effects, animations
- **Data formatting** - Number formats, date formats, units

This pipeline provides a robust, scalable system for creating interactive drilldown dashboards from multiple JSON data sources! 🚀
