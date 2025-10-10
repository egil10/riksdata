# DFO Data Integration Guide

## 🎯 Overview
This guide documents the complete process of integrating Norwegian government budget data from DFO (Direktoratet for forvaltning og økonomistyring) into the Riksdata dashboard.

## 📁 File Structure

### Data Files
```
data/cached/dfo/
├── arbeids-og-inkluderingsdepartementet-expenditure-20142015201620172018201920202021202220232024.json
├── arbeids-og-inkluderingsdepartementet-revenue-20142015201620172018201920202021202220232024.json
├── barne-og-familiedepartementet-expenditure-20142015201620172018201920202021202220232024.json
├── barne-og-familiedepartementet-revenue-20142015201620172018201920202021202220232024.json
├── energidepartementet-expenditure-20142015201620172018201920202021202220232024.json
├── energidepartementet-revenue-20142015201620172018201920202021202220232024.json
├── finansdepartementet-expenditure-20142015201620172018201920202021202220232024.json
├── finansdepartementet-revenue-20142015201620172018201920202021202220232024.json
├── forsvarsdepartementet-expenditure-20142015201620172018201920202021202220232024.json
├── forsvarsdepartementet-revenue-20142015201620172018201920202021202220232024.json
├── helse-og-omsorgsdepartementet-expenditure-20142015201620172018201920202021202220232024.json
├── helse-og-omsorgsdepartementet-revenue-20142015201620172018201920202021202220232024.json
├── justis-og-beredskapsdepartementet-expenditure-20142015201620172018201920202021202220232024.json
├── justis-og-beredskapsdepartementet-revenue-20142015201620172018201920202021202220232024.json
├── klima-og-milj-departementet-expenditure-20142015201620172018201920202021202220232024.json
├── klima-og-milj-departementet-revenue-20142015201620172018201920202021202220232024.json
├── kommunal-og-distriktsdepartementet-expenditure-20142015201620172018201920202021202220232024.json
├── kommunal-og-distriktsdepartementet-revenue-20142015201620172018201920202021202220232024.json
├── kultur-og-likestillingsdepartementet-expenditure-20142015201620172018201920202021202220232024.json
├── kultur-og-likestillingsdepartementet-revenue-20142015201620172018201920202021202220232024.json
├── kunnskapsdepartementet-expenditure-20142015201620172018201920202021202220232024.json
├── kunnskapsdepartementet-revenue-20142015201620172018201920202021202220232024.json
├── landbruks-og-matdepartementet-expenditure-20142015201620172018201920202021202220232024.json
├── landbruks-og-matdepartementet-revenue-20142015201620172018201920202021202220232024.json
├── n-rings-og-fiskeridepartementet-expenditure-20142015201620172018201920202021202220232024.json
├── n-rings-og-fiskeridepartementet-revenue-20142015201620172018201920202021202220232024.json
├── samferdselsdepartementet-expenditure-20142015201620172018201920202021202220232024.json
├── samferdselsdepartementet-revenue-20142015201620172018201920202021202220232024.json
├── utenriksdepartementet-expenditure-20142015201620172018201920202021202220232024.json
└── utenriksdepartementet-revenue-20142015201620172018201920202021202220232024.json
```

### JSON Data Format
```json
{
  "title": "Arbeids- og inkluderingsdepartementet - Utgifter",
  "description": "Aggregert utgift for Arbeids- og inkluderingsdepartementet. Annual totals.",
  "source": "Direktoratet for forvaltning og økonomistyring (DFO)",
  "source_url": "https://www.dfo.no/",
  "unit": "NOK",
  "data": [
    {
      "year": 2014,
      "value": 388917256698.71
    },
    {
      "year": 2015,
      "value": 380785743253.85
    }
  ]
}
```

## 🔧 Integration Steps

### 1. Move Data Files
```bash
# Move DFO folder from root to data/cached/
mv dfo/ data/cached/dfo/
```

### 2. Update main.js Configuration
Add chart configurations to `src/js/main.js`:

```javascript
// DFO Budget Data - Norwegian Government Department Budgets (2014-2024)
{ id: 'dfo-arbeids-inkludering-expenditure-chart', url: './data/cached/dfo/arbeids-og-inkluderingsdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Arbeids- og inkluderingsdepartementet - Utgifter', type: 'dfo-budget' },
{ id: 'dfo-arbeids-inkludering-revenue-chart', url: './data/cached/dfo/arbeids-og-inkluderingsdepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Arbeids- og inkluderingsdepartementet - Inntekter', type: 'dfo-budget' },
// ... repeat for all 30 charts
```

### 3. Update charts.js
Add DFO chart handling in `src/js/charts.js`:

```javascript
} else if (chartType === 'dfo-budget') {
    // Handle DFO budget charts (Norwegian government department budgets)
    console.log(`🎯 DFO BUDGET CHART DETECTED: ${chartTitle} (${canvasId})`);
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`Canvas with id '${canvasId}' not found`);
        return null;
    }

    console.log(`Loading DFO budget chart: ${chartTitle} from ${apiUrl}`);
    
    // Fetch data using the main pipeline
    const response = await fetch(rel(apiUrl));
    if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Raw DFO data for ${chartTitle}:`, data);

    // Parse the data using the main pipeline
    const result = parseStaticData(data);
    const { parsedData, sourceInfo } = result;
    
    console.log(`Parse result for ${chartTitle}:`, result);
    console.log(`Parsed DFO data for ${chartTitle}:`, parsedData);
    console.log(`Number of data points: ${parsedData.length}`);
    
    if (parsedData.length > 0) {
        console.log(`Sample data point:`, parsedData[0]);
        console.log(`Date check:`, parsedData[0].date instanceof Date, parsedData[0].date);
        console.log(`Value check:`, typeof parsedData[0].value, parsedData[0].value);
    }
    
    // DFO data is from 2014-2024, no need to filter by 1945
    
    // Register data for export
    const exportData = parsedData.map(d => ({
        date: d.date,
        value: d.value,
        series: chartTitle
    }));
    registerChartData(canvasId, exportData);

    // Render the chart using bar chart type for budget data
    console.log(`🎯 About to render DFO chart: ${chartTitle} with ${parsedData.length} data points`);
    console.log(`🎯 Sample DFO data:`, parsedData.slice(0, 3));
    renderChart(canvas, parsedData, chartTitle, 'bar');
    
    // Check if chart was created successfully
    if (canvas.chart) {
        console.log(`Successfully rendered ${chartTitle}: ${canvasId}`);
        hideSkeleton(canvasId);
        return canvas.chart;
    } else {
        console.warn(`Failed to render ${chartTitle}: ${canvasId}`);
        showNoDataState(canvasId);
        return null;
    }
}
```

### 4. Add DFO Chart Options
Add special chart options for DFO charts in `renderChart` function:

```javascript
} else if (title.includes('–') && (title.includes('Expenditure') || title.includes('Revenue'))) {
    // Special options for DFO Budget charts
    console.log(`🎯 DFO CHART OPTIONS APPLIED for: ${title}`);
    chartOptions = {
        ...chartOptions,
        plugins: {
            ...CHART_CONFIG.plugins,
            tooltip: {
                ...CHART_CONFIG.plugins?.tooltip,
                enabled: true,
                callbacks: {
                    label: function(context) {
                        const valueInBillions = Math.abs(context.parsed.y) / 1000000000;
                        return `${valueInBillions.toFixed(2)} billion NOK`;
                    }
                }
            }
        },
        scales: {
            ...chartOptions.scales,
            x: {
                ...chartOptions.scales.x,
                type: 'time',
                time: {
                    unit: 'year',
                    displayFormats: {
                        year: 'yyyy'
                    }
                },
                ticks: {
                    ...chartOptions.scales.x.ticks,
                    maxTicksLimit: 12,
                    callback: function(value, index, values) {
                        const date = new Date(value);
                        return date.getFullYear().toString();
                    }
                }
            },
            y: {
                ...chartOptions.scales.y,
                beginAtZero: false,  // Changed: don't force zero, let Chart.js auto-scale
                ticks: {
                    ...chartOptions.scales.y.ticks,
                    callback: function(value) {
                        const absValue = Math.abs(value);
                        if (absValue >= 1000000000) {
                            return (value / 1000000000).toFixed(0) + 'B';
                        } else if (absValue >= 1000000) {
                            return (value / 1000000).toFixed(0) + 'M';
                        } else if (absValue >= 1000) {
                            return (value / 1000).toFixed(0) + 'K';
                        }
                        return value.toLocaleString();
                    }
                }
            }
        },
        elements: {
            ...CHART_CONFIG.elements,
            bar: {
                ...CHART_CONFIG.elements?.bar,
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false
            }
        }
    };
}
```

### 5. Update HTML Cards
Add HTML chart cards to `index.html`:

```html
<!-- Arbeids- og inkluderingsdepartementet - Utgifter -->
<div class="chart-card" data-chart-id="dfo-arbeids-inkludering-expenditure-chart" data-source="dfo">
    <div class="chart-header">
        <div class="chart-header-top">
            <h3 title="Arbeids- og inkluderingsdepartementet - Utgifter">Arbeids- og inkluderingsdepartementet - Utgifter</h3>
            <div class="chart-actions" role="toolbar" aria-label="Chart actions">
                <button class="icon-btn" data-action="copy" aria-label="Copy data" title="Copy data">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
                </button>
                <button class="icon-btn" data-action="download" aria-label="Download chart" title="Download chart">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17V3"></path><path d="m6 11 6 6 6-6"></path><path d="M19 21H5"></path></svg>
                </button>
                <button class="icon-btn" data-action="fullscreen" aria-label="Fullscreen" title="Fullscreen">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M21 8V5a2 2 0 0 0-2-2h-3"></path><path d="M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path></svg>
                </button>
            </div>
        </div>
        <div class="chart-subtitle-row">
            <div class="chart-subtitle">NOK (billions)</div>
            <div class="subtitle-actions">
                <a href="https://www.dfo.no/" target="_blank" class="source-link">DFO</a>
            </div>
        </div>
    </div>
    <div class="skeleton-chart" id="dfo-arbeids-inkludering-expenditure-chart-skeleton"></div>
    <div class="chart-container">
        <canvas id="dfo-arbeids-inkludering-expenditure-chart"></canvas>
        <div class="static-tooltip" id="dfo-arbeids-inkludering-expenditure-chart-tooltip"></div>
    </div>
</div>
```

### 6. Update Footer
Add DFO to data sources in `index.html` footer:

```html
<a href="https://www.dfo.no/" target="_blank" class="source-link">DFO (Norwegian Budget)</a>
```

## 🚨 Critical Issues & Solutions

### Issue 1: Lazy Loading Not Detecting Charts
**Problem**: DFO charts not being detected by IntersectionObserver
**Solution**: Fix chart ID detection in `setupLazyChartLoading()`:

```javascript
// WRONG:
const chartId = canvas?.id;

// CORRECT:
const chartId = card.getAttribute('data-chart-id');
```

### Issue 2: Chart Data Undefined
**Problem**: `chartData` variable scope issue causing undefined chart data
**Solution**: Remove duplicate `let chartData;` declaration:

```javascript
} else {
    // Bar charts: color each bar individually by political party
    // chartData already declared above  ← Remove duplicate declaration
    
    // Special styling for Housing Starts chart
    if (title === 'Housing Starts') {
        chartData = {
            // ... chart data construction
        };
    } else {
        // Default bar chart styling
        chartData = {
            // ... chart data construction
        };
    }
}
```

### Issue 3: Negative Values Not Displaying
**Problem**: Negative values in revenue data not showing properly
**Solution**: Use proper chart configuration:

```javascript
y: {
    ...chartOptions.scales.y,
    beginAtZero: false,  // Allow negative values
    ticks: {
        ...chartOptions.scales.y.ticks,
        callback: function(value) {
            const absValue = Math.abs(value);
            if (absValue >= 1000000000) {
                return (value / 1000000000).toFixed(0) + 'B';
            } else if (absValue >= 1000000) {
                return (value / 1000000).toFixed(0) + 'M';
            } else if (absValue >= 1000) {
                return (value / 1000).toFixed(0) + 'K';
            }
            return value.toLocaleString();
        }
    }
}
```

### Issue 4: Chart Type Detection
**Problem**: Charts not being rendered as bar charts
**Solution**: Use correct chart type in `renderChart` call:

```javascript
// Render the chart using bar chart type for budget data
renderChart(canvas, parsedData, chartTitle, 'bar');
```

## 🔍 Debugging Checklist

### 1. Check Data Files
```bash
# Verify files exist
ls -la data/cached/dfo/

# Check file structure
head -10 data/cached/dfo/arbeids-og-inkluderingsdepartementet-expenditure-*.json
```

### 2. Check Configuration
```bash
# Verify chart configs in main.js
grep -n "dfo-" src/js/main.js

# Verify HTML cards
grep -n "data-chart-id.*dfo-" index.html
```

### 3. Check Console Logs
Look for these messages in browser console:
- `🔧 DFO DEBUGGING ENABLED - Looking for DFO charts...`
- `🎯 Total DFO charts found: 33`
- `🎯 DFO BUDGET CHART DETECTED: [chart name]`
- `🎯 About to render DFO chart: [chart name] with X data points`
- `🎯 DFO CHART OPTIONS APPLIED for: [chart name]`

### 4. Check Chart Data
Verify chart data is not undefined:
- `Chart data: {labels: Array(11), datasets: Array(1)}` ✅
- `Chart data: undefined` ❌

## 📊 Data Characteristics

### Expenditure vs Revenue
- **Expenditure**: Positive values (money spent)
- **Revenue**: Negative values (money received, often negative in government budgets)

### Value Ranges
- **Expenditure**: 50-600 billion NOK
- **Revenue**: -1 to -2 billion NOK

### Time Period
- **Years**: 2014-2024 (11 data points)
- **Frequency**: Annual

## 🎨 Chart Styling

### Colors
- Uses political period colors when available
- Falls back to theme accent color
- Bars have rounded corners and borders

### Formatting
- **Y-axis**: Billions (B), Millions (M), Thousands (K)
- **Tooltips**: "X.XX billion NOK"
- **X-axis**: Full years (2014, 2015, etc.)

## 🚀 Performance Considerations

### Lazy Loading
- Charts load when they enter viewport
- 800px margin for preloading
- One-time rendering per chart

### Data Size
- 30 charts × 11 data points = 330 total data points
- Minimal impact on performance

## 🔄 Future Updates

### Adding New Departments
1. Add JSON file to `data/cached/dfo/`
2. Add configuration to `main.js`
3. Add HTML card to `index.html`
4. Test with browser console

### Updating Data
1. Replace JSON files in `data/cached/dfo/`
2. Clear browser cache
3. Refresh page

### Adding New Chart Types
1. Add new `chartType` handling in `charts.js`
2. Add special options if needed
3. Update configuration in `main.js`

## 📝 Notes

- **Norwegian Titles**: Use Norwegian department names in titles
- **File Naming**: Long descriptive filenames are fine
- **Data Validation**: Check for negative values in revenue data
- **Error Handling**: Charts gracefully handle missing data
- **Export**: Data is registered for copy/download functionality

## 🎯 Success Indicators

✅ **DFO charts detected**: Console shows "DFO CHART!" messages
✅ **Data loaded**: Console shows parsed data with 11 points
✅ **Charts rendered**: Console shows "Chart created successfully"
✅ **Data visible**: Charts display actual bar charts with data
✅ **Negative values**: Revenue charts show negative values properly
✅ **Tooltips work**: Hover shows "X.XX billion NOK"
✅ **Export works**: Copy/download buttons functional

---

**Last Updated**: January 10, 2025
**Status**: ✅ Working
**Total Charts**: 30 DFO budget charts
**Data Period**: 2014-2024
**Chart Type**: Line charts with absolute values (positive)
