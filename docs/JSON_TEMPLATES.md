# JSON Templates for Riksdata

Quick copy-paste templates for creating data files. Choose the appropriate template and fill in your data.

## 📊 Template 1: Simple Annual Data

```json
{
  "title": "YOUR_DATASET_TITLE",
  "description": "Brief description of what this data represents",
  "source": "DATA_SOURCE_NAME",
  "source_url": "https://example.com/source-url",
  "unit": "UNIT_OF_MEASUREMENT",
  "data": [
    {"year": 2019, "value": 123.45},
    {"year": 2020, "value": 124.67},
    {"year": 2021, "value": 125.89},
    {"year": 2022, "value": 127.12},
    {"year": 2023, "value": 128.34}
  ]
}
```

## 📈 Template 2: Multi-Category Annual Data

```json
{
  "title": "YOUR_DATASET_TITLE",
  "description": "Brief description of what this data represents",
  "source": "DATA_SOURCE_NAME",
  "source_url": "https://example.com/source-url",
  "unit": "UNIT_OF_MEASUREMENT",
  "data": [
    {
      "year": 2020,
      "category1": 50.2,
      "category2": 30.1,
      "category3": 43.15,
      "total": 123.45
    },
    {
      "year": 2021,
      "category1": 51.5,
      "category2": 31.2,
      "category3": 44.8,
      "total": 127.5
    }
  ]
}
```

## 📅 Template 3: Monthly Data

```json
{
  "title": "YOUR_DATASET_TITLE",
  "description": "Brief description of what this data represents",
  "source": "DATA_SOURCE_NAME",
  "source_url": "https://example.com/source-url",
  "unit": "UNIT_OF_MEASUREMENT",
  "frequency": "monthly",
  "data": [
    {"date": "2023-01-01", "value": 123.45},
    {"date": "2023-02-01", "value": 124.67},
    {"date": "2023-03-01", "value": 125.89},
    {"date": "2023-04-01", "value": 127.12},
    {"date": "2023-05-01", "value": 128.34}
  ]
}
```

## 📅 Template 4: Quarterly Data

```json
{
  "title": "YOUR_DATASET_TITLE",
  "description": "Brief description of what this data represents",
  "source": "DATA_SOURCE_NAME",
  "source_url": "https://example.com/source-url",
  "unit": "UNIT_OF_MEASUREMENT",
  "frequency": "quarterly",
  "data": [
    {"date": "2023-01-01", "value": 123.45},
    {"date": "2023-04-01", "value": 124.67},
    {"date": "2023-07-01", "value": 125.89},
    {"date": "2023-10-01", "value": 127.12}
  ]
}
```

## 💱 Template 5: Exchange Rate Data

```json
{
  "title": "CURRENCY_PAIR Exchange Rate",
  "description": "Currency pair exchange rate description",
  "source": "Norges Bank",
  "source_url": "https://www.norges-bank.no/en/topics/Statistics/exchange_rates/",
  "unit": "NOK per CURRENCY",
  "frequency": "daily",
  "data": [
    {"date": "2023-01-01", "value": 8.95},
    {"date": "2023-01-02", "value": 8.92},
    {"date": "2023-01-03", "value": 8.98}
  ]
}
```

## 📊 Template 6: Percentage/Index Data

```json
{
  "title": "YOUR_INDICATOR_NAME",
  "description": "Brief description of the indicator",
  "source": "DATA_SOURCE_NAME",
  "source_url": "https://example.com/source-url",
  "unit": "Percent",
  "data": [
    {"year": 2019, "value": 2.1},
    {"year": 2020, "value": 1.8},
    {"year": 2021, "value": 3.2},
    {"year": 2022, "value": 5.3},
    {"year": 2023, "value": 4.1}
  ]
}
```

## 🔢 Template 7: Large Numbers (Billions/Millions)

```json
{
  "title": "YOUR_DATASET_TITLE",
  "description": "Brief description of what this data represents",
  "source": "DATA_SOURCE_NAME",
  "source_url": "https://example.com/source-url",
  "unit": "Billion NOK",
  "data": [
    {"year": 2019, "value": 1234.5},
    {"year": 2020, "value": 1245.7},
    {"year": 2021, "value": 1256.9},
    {"year": 2022, "value": 1267.2},
    {"year": 2023, "value": 1278.4}
  ]
}
```

## 📋 Field Reference

### Required Fields:
- `title`: Chart title (string)
- `description`: Data description (string)
- `source`: Data source name (string)
- `source_url`: Source URL (string)
- `unit`: Unit of measurement (string)
- `data`: Array of data points

### Optional Fields:
- `frequency`: "daily", "monthly", "quarterly", "yearly"
- `last_updated`: ISO date string
- `notes`: Additional notes

### Data Point Fields:
- `year`: Year (number) - for annual data
- `date`: Date string (YYYY-MM-DD) - for monthly/quarterly data
- `value`: Main value (number) - preferred field name
- `total`: Alternative to value (number)
- `amount`: Alternative to value (number)
- `index`: Alternative to value (number)

## 🚀 Quick Start Steps

1. **Choose a template** above that matches your data type
2. **Copy the template** and paste it into a new file
3. **Replace placeholder text** with your actual data
4. **Save as** `your-dataset-name.json` in `data/static/`
5. **Validate JSON** using [JSONLint](https://jsonlint.com/)
6. **Test locally** by adding to the website

## 📝 Example: GDP Growth Rate

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

Save this as `data/static/gdp-growth-rate.json` and you're ready to integrate it into the website!
