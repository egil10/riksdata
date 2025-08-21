# Norway Armed Forces Personnel Chart Pipeline

## Overview
This document traces the complete pipeline for the "Norway Armed Forces Personnel" chart, from data source to visualization.

## 1. Data Source
- **Source**: International Institute for Strategic Studies (IISS), via World Bank
- **Processing**: Our World in Data (OWID)
- **Retrieval Date**: 2025-08-21
- **Variable**: `ms_mil_totl_p1` (Armed forces personnel total)
- **Unit**: persons

## 2. Data Format

### Raw JSON Structure
```json
{
  "dataset": "armed-forces-personnel (IISS via World Bank, OWID processed)",
  "country": "Norway",
  "metadata": {
    "title": "Armed forces personnel (total)",
    "variable": "ms_mil_totl_p1",
    "unit": "persons",
    "description": {},
    "owidTags": {},
    "dataPublishedBy": {},
    "dataPublisherSource": {},
    "lastUpdated": {},
    "retrieved": "2025-08-21",
    "source_and_citation": "Source: International Institute for Strategic Studies (IISS), via World Bank (2025) – processed by Our World in Data. 'Armed forces personnel' counts active-duty personnel, including paramilitary forces when organized and controlled to support/replace regular military."
  },
  "data": [
    {
      "Entity": "Norway",
      "Code": "NOR",
      "Year": 1985,
      "value": 37000
    },
    {
      "Entity": "Norway",
      "Code": "NOR",
      "Year": 1989,
      "value": 43000
    }
    // ... more data points
  ]
}
```

### Data Points Sample
- 1985: 37,000 persons
- 1989: 43,000 persons
- 1990: 51,000 persons
- 1991: 41,000 persons
- 1992: 36,000 persons
- 1993: 32,000 persons
- 1994: 33,000 persons
- 1995: 30,700 persons
- 1996: 30,700 persons
- 1997: 34,300 persons
- 1998: 28,870 persons
- 1999: 31,000 persons
- 2000: 27,000 persons
- 2001: 26,700 persons

## 3. File Storage
- **Location**: `data/static/norway_armed_forces_personnel.json`
- **Size**: ~4.2KB
- **Records**: 217 lines
- **Data Points**: ~30+ years of data

## 4. Chart Module Implementation

### File: `src/js/charts/norway-armed-forces-personnel.js`

```javascript
// ============================================================================
// NORWAY ARMED FORCES PERSONNEL CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchArmedForcesPersonnelData() {
    try {
        const response = await fetch('./data/static/norway_armed_forces_personnel.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching armed forces personnel data:', error);
        throw error;
    }
}

export async function renderArmedForcesPersonnelChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchArmedForcesPersonnelData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Armed Forces Personnel');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for armed forces personnel chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Armed Forces Personnel'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Armed Forces Personnel', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering armed forces personnel chart:', error);
        throw error;
    }
}
```

## 5. Data Parsing Pipeline

### Step 1: Static Data Parser (`parseStaticData`)
```javascript
export function parseStaticData(data, chartTitle) {
    try {
        // Normalize incoming shape: either {data: [...]} or just [...]
        const rows = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        if (!rows.length) return [];

        // Generic static data parser (OWID etc.)
        const preferredNumericKeys = new Set(['value', 'total', 'amount']);
        const skipKeys = new Set(['year', 'date', 'entity', 'code', 'country', 'location', 'is_missing']);

        return rows
            .map(item => {
                const k = Object.fromEntries(Object.entries(item).map(([kk, vv]) => [kk.toLowerCase(), vv]));

                // Build date
                let date = null;
                if (k.date) {
                    date = new Date(k.date);
                } else if (k.year) {
                    const y = Number(k.year);
                    if (Number.isFinite(y)) date = new Date(y, 0, 1);
                }

                // Find value
                let value = null;
                for (const key of preferredNumericKeys) {
                    if (k[key] != null && k[key] !== '') {
                        value = Number(k[key]);
                        break;
                    }
                }

                return { date, value };
            })
            .filter(d => d.date instanceof Date && !isNaN(d.date) && Number.isFinite(d.value))
            .sort((a, b) => a.date - b.date);
    } catch (error) {
        console.error('Error parsing static data:', error);
        return [];
    }
}
```

### Step 2: Data Transformation
1. **Field Normalization**: All field names converted to lowercase
   - `Year` → `year`
   - `value` → `value`
   - `Entity` → `entity`
   - `Code` → `code`

2. **Date Conversion**: Year values converted to Date objects (January 1st of each year)
   - `1985` → `new Date(1985, 0, 1)`

3. **Value Extraction**: Numeric values extracted from `value` field
   - `37000` → `Number(37000)`

4. **Filtering**: Invalid dates and non-finite values removed

5. **Sorting**: Data points sorted chronologically

## 6. Chart Loading Pipeline

### Step 1: Chart Registry (`src/js/charts.js`)
```javascript
// Chart configuration mapping
const chartConfigs = {
    'norway-armed-forces-personnel-chart': {
        apiUrl: './data/static/norway_armed_forces_personnel.json',
        title: 'Norway Armed Forces Personnel',
        type: 'line'
    }
};
```

### Step 2: Loader Function
```javascript
async function loadArmedForcesPersonnelChart(canvasId, apiUrl, chartTitle, chartType) {
    try {
        console.log(`Loading armed forces personnel chart: ${canvasId} - ${chartTitle}`);
        
        // Import and render the armed forces personnel chart
        const { renderArmedForcesPersonnelChart } = await import('./charts/norway-armed-forces-personnel.js');
        const chart = await renderArmedForcesPersonnelChart(canvasId);
        
        if (chart) {
            console.log(`Successfully rendered armed forces personnel chart: ${canvasId}`);
            hideSkeleton(canvasId);
        } else {
            console.warn(`Failed to render armed forces personnel chart: ${canvasId}`);
            showNoDataState(canvasId);
        }
        
        return chart;
        
    } catch (error) {
        console.error(`Failed to load armed forces personnel chart ${canvasId}:`, error);
        showNoDataState(canvasId);
        return null;
    }
}
```

### Step 3: Data Loading (`loadChartData`)
```javascript
export async function loadChartData(canvasId, apiUrl, chartTitle, chartType = 'line') {
    try {
        // Fetch data from API or static file
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // Parse data based on source type
        let parsedData;
        if (apiUrl.startsWith('./data/static/') || apiUrl.startsWith('data/static/')) {
            // Handle OWID static data files
            parsedData = parseStaticData(data, chartTitle);
        }
        
        // Validate data
        if (!parsedData || parsedData.length < 1) {
            console.warn(`No data points after parsing for ${chartTitle}`);
            return null;
        }
        
        // Filter data from 1945 onwards
        const filteredData = parsedData.filter(item => {
            const year = new Date(item.date).getFullYear();
            return year >= 1945;
        });
        
        // Use filtered data if available, otherwise use all data
        const finalFiltered = filteredData.length >= 1 ? filteredData : 
                             parsedData.length >= 1 ? parsedData : 
                             filteredData;
        
        // Render the chart
        renderChart(canvas, finalFiltered, chartTitle, chartType);
        
        return true;
        
    } catch (error) {
        console.error(`Error loading data for ${canvasId} (${chartTitle}):`, error);
        return null;
    }
}
```

## 7. Chart Rendering Pipeline

### Step 1: Chart.js Configuration
```javascript
export function renderChart(canvas, data, title, chartType = 'line') {
    console.log(`Rendering chart: ${title} with ${data.length} data points`);
    
    // Clear any existing chart
    if (canvas.chart) {
        canvas.chart.destroy();
    }

    // Configure chart data
    const chartData = {
        labels: data.map(item => item.date),
        datasets: [
            {
                label: title,
                data: data.map(item => ({ x: item.date, y: item.value })),
                borderWidth: 2,
                borderColor: '#3b82f6',
                fill: false,
                segment: {
                    borderColor: (ctx) => {
                        const xVal = ctx.p0?.parsed?.x;
                        const period = xVal ? getPoliticalPeriod(new Date(xVal)) : null;
                        return period?.color || '#3b82f6';
                    }
                }
            }
        ]
    };

    // Create Chart.js instance
    canvas.chart = new Chart(canvas, {
        type: chartType,
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'year'
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
```

### Step 2: Political Period Coloring
The chart automatically applies political period coloring based on Norwegian government periods:
- **Conservative/Right-wing**: Blue tones
- **Labour/Left-wing**: Red tones
- **Coalition**: Mixed colors

## 8. HTML Integration

### Chart Container (`index.html`)
```html
<div class="chart-card">
    <div class="chart-header">
        <h3>Norway Armed Forces Personnel</h3>
        <div class="chart-meta">
            <span class="unit">persons</span>
            <span class="source">Our World in Data</span>
        </div>
    </div>
    <div class="chart-container">
        <canvas id="norway-armed-forces-personnel-chart"></canvas>
    </div>
</div>
```

## 9. Data Export Registration

### Export Data Structure
```javascript
const exportData = parsedData.map(d => ({
    date: d.date,
    value: d.value,
    series: 'Armed Forces Personnel'
}));
registerChartData(canvasId, exportData);
```

## 10. Error Handling

### No Data State
```javascript
function showNoDataState(chartId) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    const chartContainer = canvas.closest('.chart-container');
    if (chartContainer) {
        const noDataDiv = document.createElement('div');
        noDataDiv.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: var(--text-muted);
            font-size: 0.875rem;
            text-align: center;
            padding: 1rem;
        `;
        noDataDiv.textContent = 'No data available';
        
        chartContainer.innerHTML = '';
        chartContainer.appendChild(noDataDiv);
    }
}
```

## 11. Performance Optimizations

### Mobile Optimization
- Data points limited on mobile devices for better performance
- Responsive chart sizing
- Optimized rendering for small screens

### Caching
- Static JSON files cached by browser
- Chart instances cached in `window.chartInstances`

## 12. Troubleshooting

### Common Issues
1. **"No data available"**: Check if JSON file exists and has valid data
2. **Chart not rendering**: Verify Chart.js is loaded
3. **Wrong data**: Check field name normalization in parser
4. **Performance issues**: Check data point count and mobile optimization

### Debug Steps
1. Check browser console for errors
2. Verify JSON file structure matches expected format
3. Test data parsing with sample data
4. Check chart module imports and exports
5. Verify canvas element exists in DOM

## 13. Future Enhancements

### Potential Improvements
1. **Real-time updates**: API integration for live data
2. **Interactive features**: Zoom, pan, tooltips
3. **Multiple series**: Compare with other countries
4. **Export options**: CSV, PNG, PDF export
5. **Annotations**: Historical events overlay

This pipeline ensures reliable data visualization from source to screen, with proper error handling and performance optimization.
