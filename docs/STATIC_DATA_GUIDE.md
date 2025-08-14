# Static Data Guide

This guide explains how to add static data tables to the Riksdata website.

## Overview

The website supports static data files in JSON format that can be displayed as charts. This is useful for:
- Historical data that doesn't change frequently
- Data from sources that don't provide APIs
- Custom datasets you want to include
- Data that needs manual curation

## File Structure

Static data files should be placed in the `data/static/` directory:

```
data/
├── static/
│   ├── oil-fund.json          # Oil fund data (example)
│   ├── your-dataset.json      # Your custom dataset
│   └── ...
```

## JSON Format

Static data files should follow this structure:

```json
{
  "title": "Dataset Title",
  "description": "Brief description of the dataset",
  "source": "Data source name",
  "source_url": "https://example.com/source",
  "unit": "Unit of measurement",
  "data": [
    {
      "year": 1998,
      "value": 172,
      "category1": 102,
      "category2": 70
    },
    {
      "year": 1999,
      "value": 222,
      "category1": 129,
      "category2": 94
    }
  ]
}
```

### Required Fields

- **title**: Human-readable title for the dataset
- **description**: Brief description of what the data represents
- **source**: Name of the data source
- **source_url**: URL to the original data source
- **unit**: Unit of measurement (e.g., "Billion NOK", "Percent", "Index")
- **data**: Array of data points

### Data Point Format

Each data point can have:
- **year**: Year for the data point (required for time series)
- **date**: Full date string (alternative to year)
- **value**: Main value to display (required)
- **total**: Alternative name for main value
- **amount**: Alternative name for main value
- Additional fields for subcategories (optional)

## Example: Oil Fund Data

The oil fund data file (`data/static/oil-fund.json`) demonstrates the format:

```json
{
  "title": "Oil Fund Value Development",
  "description": "The Government Pension Fund Global (Oil Fund) market value by asset class, 1998-2025",
  "source": "Norges Bank Investment Management",
  "source_url": "https://www.nbim.no/en/investments/the-funds-value/",
  "unit": "billion NOK",
  "data": [
    {
      "year": 1998,
      "renewable_energy": 0,
      "real_estate": 0,
      "fixed_income": 102,
      "equity": 70,
      "total": 172
    }
  ]
}
```

## Adding a New Static Dataset

### Step 1: Create the JSON File

1. Create a new JSON file in `data/static/`
2. Follow the format above
3. Include all required fields
4. Ensure data is in chronological order

### Step 2: Add Chart Loading

Add the chart loading call to `src/js/main.js`:

```javascript
// Add this line to the chartPromises array
loadChartData('your-chart-id', './data/static/your-dataset.json', 'Your Chart Title', 'line'),
```

### Step 3: Add HTML Canvas

Add the chart container to `index.html`:

```html
<div class="chart-card">
    <div class="chart-header">
        <h3>Your Chart Title</h3>
        <a href="https://your-source-url.com" target="_blank" class="source-link">Source Name</a>
        <div class="chart-subtitle">Unit of Measurement</div>
    </div>
    <div class="skeleton-chart" id="your-chart-id-skeleton"></div>
    <div class="chart-container">
        <canvas id="your-chart-id"></canvas>
        <div class="static-tooltip" id="your-chart-id-tooltip"></div>
    </div>
</div>
```

### Step 4: Test the Implementation

1. Start the development server: `python -m http.server 8000`
2. Open `http://localhost:8000` in your browser
3. Check that the chart loads correctly
4. Verify the data is displayed properly

## Data Validation

Use the test script to validate your data:

```bash
python tools/test_oil_fund.py
```

You can modify this script to test your own datasets.

## Chart Types

Static data supports different chart types:

- **line**: Line chart (default)
- **bar**: Bar chart
- **area**: Area chart

Specify the chart type in the `loadChartData` call:

```javascript
loadChartData('chart-id', './data/static/data.json', 'Title', 'bar'),
```

## Data Processing

The static data parser automatically:

1. Converts year values to dates (January 1st of each year)
2. Sorts data chronologically
3. Filters data from 1945 onwards (configurable)
4. Optimizes for mobile devices
5. Adds political period coloring (if applicable)

## Best Practices

1. **Data Quality**: Ensure data is accurate and complete
2. **Consistency**: Use consistent field names and data types
3. **Documentation**: Include clear descriptions and source information
4. **Validation**: Test your data before adding to production
5. **Updates**: Plan for how to update the data when new values become available

## Troubleshooting

### Chart Not Loading
- Check browser console for errors
- Verify JSON syntax is valid
- Ensure file path is correct
- Check that canvas ID matches between HTML and JavaScript

### Data Not Displaying
- Verify data structure matches expected format
- Check that required fields are present
- Ensure data values are numeric
- Validate chronological order

### Performance Issues
- Limit data points for very large datasets
- Consider aggregating data for long time series
- Use mobile optimization for better performance

## Future Enhancements

Potential improvements for static data support:

1. **Multiple Series**: Support for multiple data series in one chart
2. **Interactive Features**: Zoom, pan, and filtering capabilities
3. **Export Options**: CSV/Excel export functionality
4. **Data Validation**: Automated validation of data consistency
5. **Update Notifications**: Alerts when data needs updating

## Examples

See the following files for examples:
- `data/static/oil-fund.json` - Oil fund value data
- `src/js/charts.js` - Static data parsing logic
- `src/js/main.js` - Chart loading configuration
- `index.html` - HTML chart containers
