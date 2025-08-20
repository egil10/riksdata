# Data Format Guide for Riksdata

This guide provides comprehensive instructions for producing JSON data files that can be easily integrated into the Riksdata website. Follow these specifications to ensure seamless data integration.

## 📁 File Organization

### Directory Structure
```
data/
├── cached/           # Cached API data (auto-generated)
│   ├── ssb/         # Statistics Norway datasets
│   ├── norges-bank/ # Norges Bank datasets
│   ├── nve/         # NVE datasets
│   └── statnett/    # Statnett datasets
└── static/          # Static data files (manual uploads)
    ├── your-dataset.json
    └── ...
```

### File Naming Convention
- Use lowercase letters and hyphens: `your-dataset-name.json`
- Be descriptive but concise
- Include source abbreviation if relevant: `ssb-population-growth.json`

## 📊 JSON Data Formats

### 1. Simple Time Series Format (Recommended)

This is the most straightforward format for most datasets:

```json
{
  "title": "Dataset Title",
  "description": "Brief description of what the data represents",
  "source": "Data Source Name",
  "source_url": "https://example.com/source",
  "unit": "Unit of measurement (e.g., 'Billion NOK', 'Percent', 'Index')",
  "data": [
    {
      "year": 1998,
      "value": 172.5
    },
    {
      "year": 1999,
      "value": 222.3
    },
    {
      "year": 2000,
      "value": 386.1
    }
  ]
}
```

### 2. Multi-Category Time Series Format

For datasets with multiple categories or breakdowns:

```json
{
  "title": "Oil Fund Asset Allocation",
  "description": "Government Pension Fund Global asset allocation by category",
  "source": "Norges Bank Investment Management",
  "source_url": "https://www.nbim.no/en/investments/",
  "unit": "Billion NOK",
  "data": [
    {
      "year": 1998,
      "equity": 70,
      "fixed_income": 102,
      "real_estate": 0,
      "renewable_infrastructure": 0,
      "total": 172
    },
    {
      "year": 1999,
      "equity": 94,
      "fixed_income": 129,
      "real_estate": 0,
      "renewable_infrastructure": 0,
      "total": 222
    }
  ]
}
```

### 3. Monthly/Quarterly Data Format

For higher frequency data (monthly, quarterly):

```json
{
  "title": "Consumer Price Index",
  "description": "Monthly consumer price index development",
  "source": "Statistics Norway",
  "source_url": "https://www.ssb.no/en/statbank/table/03013",
  "unit": "Index (2015=100)",
  "frequency": "monthly",
  "data": [
    {
      "date": "2020-01-01",
      "value": 108.2
    },
    {
      "date": "2020-02-01",
      "value": 108.5
    },
    {
      "date": "2020-03-01",
      "value": 108.8
    }
  ]
}
```

### 4. Exchange Rate Format

For currency exchange rate data:

```json
{
  "title": "USD/NOK Exchange Rate",
  "description": "US Dollar to Norwegian Krone exchange rate",
  "source": "Norges Bank",
  "source_url": "https://www.norges-bank.no/en/topics/Statistics/exchange_rates/",
  "unit": "NOK per USD",
  "frequency": "daily",
  "data": [
    {
      "date": "2020-01-01",
      "value": 8.95
    },
    {
      "date": "2020-01-02",
      "value": 8.92
    }
  ]
}
```

## 🔧 Required Fields

### Metadata Fields
- **title** (string): Human-readable title for the dataset
- **description** (string): Brief description of what the data represents
- **source** (string): Name of the data source organization
- **source_url** (string): URL to the original data source
- **unit** (string): Unit of measurement

### Optional Metadata Fields
- **frequency** (string): Data frequency ("daily", "monthly", "quarterly", "yearly")
- **last_updated** (string): ISO date when data was last updated
- **notes** (string): Additional notes about the data

### Data Array
- **data** (array): Array of data points

## 📅 Date/Time Formats

### Year Format
```json
{
  "year": 2023,
  "value": 123.45
}
```

### Full Date Format
```json
{
  "date": "2023-12-31",
  "value": 123.45
}
```

### ISO Date Format (Recommended for monthly/quarterly)
```json
{
  "date": "2023-12-01T00:00:00.000Z",
  "value": 123.45
}
```

## 📈 Data Point Structure

### Single Value
```json
{
  "year": 2023,
  "value": 123.45
}
```

### Multiple Values (Categories)
```json
{
  "year": 2023,
  "category1": 50.2,
  "category2": 30.1,
  "category3": 43.15,
  "total": 123.45
}
```

### Alternative Value Field Names
The system recognizes these field names as the main value:
- `value` (preferred)
- `total`
- `amount`
- `index`

## 🎨 Chart Configuration

### Chart Types Supported
- **line**: Line charts (default)
- **bar**: Bar charts
- **area**: Area charts

### Political Period Coloring
The system automatically applies political party colors to time series data based on Norwegian government periods. No additional configuration needed.

## 📋 Data Quality Requirements

### Minimum Requirements
- At least 2 data points for a valid chart
- Data should be in chronological order
- No missing values (use null for missing data points)
- Consistent data types (all numbers should be numbers, not strings)

### Recommended Practices
- Include data from 1945 onwards when possible
- Use consistent decimal places (2-3 decimal places recommended)
- Include source attribution
- Provide meaningful descriptions

## 🔄 Integration Process

### Step 1: Create JSON File
1. Create your JSON file following the format above
2. Save it in the appropriate directory:
   - `data/static/` for manually created datasets
   - `data/cached/` for API-fetched datasets

### Step 2: Add to Website
1. Add chart loading call to `src/js/main.js`:
```javascript
{ 
  id: 'your-chart-id', 
  url: './data/static/your-dataset.json', 
  title: 'Your Chart Title' 
}
```

2. Add HTML canvas to `index.html`:
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

### Step 3: Test
1. Start local server: `python -m http.server 8000`
2. Open `http://localhost:8000`
3. Verify chart loads correctly

## 📝 Examples

### Example 1: Simple Economic Indicator
```json
{
  "title": "GDP Growth Rate",
  "description": "Annual GDP growth rate in Norway",
  "source": "Statistics Norway",
  "source_url": "https://www.ssb.no/en/nasjonalregnskap-og-konjunkturer",
  "unit": "Percent",
  "data": [
    {"year": 2019, "value": 0.7},
    {"year": 2020, "value": -0.8},
    {"year": 2021, "value": 3.9},
    {"year": 2022, "value": 3.3},
    {"year": 2023, "value": 1.1}
  ]
}
```

### Example 2: Multi-Category Dataset
```json
{
  "title": "Employment by Sector",
  "description": "Employment numbers by economic sector",
  "source": "Statistics Norway",
  "source_url": "https://www.ssb.no/en/arbeid-og-lonn",
  "unit": "Thousands",
  "data": [
    {
      "year": 2020,
      "manufacturing": 320,
      "services": 1850,
      "construction": 220,
      "agriculture": 45,
      "total": 2435
    },
    {
      "year": 2021,
      "manufacturing": 325,
      "services": 1880,
      "construction": 225,
      "agriculture": 44,
      "total": 2474
    }
  ]
}
```

### Example 3: Monthly Data
```json
{
  "title": "Monthly Inflation Rate",
  "description": "Monthly consumer price inflation rate",
  "source": "Statistics Norway",
  "source_url": "https://www.ssb.no/en/priser-og-prisindekser",
  "unit": "Percent",
  "frequency": "monthly",
  "data": [
    {"date": "2023-01-01", "value": 7.5},
    {"date": "2023-02-01", "value": 7.3},
    {"date": "2023-03-01", "value": 6.8}
  ]
}
```

## 🚨 Common Mistakes to Avoid

1. **Inconsistent data types**: Don't mix strings and numbers
2. **Missing required fields**: Always include title, description, source, unit
3. **Incorrect date formats**: Use ISO format for dates
4. **Unordered data**: Ensure chronological order
5. **Missing source attribution**: Always include source and source_url
6. **Unclear units**: Be specific about units of measurement

## 🔧 Validation Tools

### JSON Schema Validation
Use online JSON validators to ensure your JSON is syntactically correct:
- [JSONLint](https://jsonlint.com/)
- [JSON Schema Validator](https://www.jsonschemavalidator.net/)

### Data Validation Checklist
- [ ] JSON syntax is valid
- [ ] All required fields are present
- [ ] Data is in chronological order
- [ ] No missing values (use null if needed)
- [ ] Source attribution is complete
- [ ] Units are clearly specified
- [ ] At least 2 data points included

## 📞 Support

If you encounter issues with data integration:
1. Check the browser console for error messages
2. Verify JSON syntax with a validator
3. Ensure all required fields are present
4. Test with a simple dataset first

For additional help, refer to the existing data files in `data/cached/` and `data/static/` for examples of working formats.
