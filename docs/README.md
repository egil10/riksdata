# Riksdata Documentation

This directory contains comprehensive documentation for the Riksdata project.

## 📚 Available Documentation

### 🚀 Getting Started
- **[README.md](../README.md)** - Main project documentation and setup guide
- **[REPOSITORY_ORGANIZATION.md](REPOSITORY_ORGANIZATION.md)** - Project structure and organization

### 📊 Data Integration Guides
- **[DATA_FORMAT_GUIDE.md](DATA_FORMAT_GUIDE.md)** - Comprehensive guide for creating JSON data files
- **[JSON_TEMPLATES.md](JSON_TEMPLATES.md)** - Quick copy-paste templates for different data types
- **[STATIC_DATA_GUIDE.md](STATIC_DATA_GUIDE.md)** - Guide for adding static data tables

### 🔧 Development Tools
- **[scripts/add-dataset.py](../scripts/add-dataset.py)** - Automated script for adding new datasets

## 🎯 Quick Start for Adding Data

### Option 1: Manual Integration
1. Create your JSON file using templates from `JSON_TEMPLATES.md`
2. Follow the format specifications in `DATA_FORMAT_GUIDE.md`
3. Add chart configuration to `src/js/main.js`
4. Add HTML canvas to `index.html`
5. Test locally

### Option 2: Automated Integration (Recommended)
1. Create your JSON file using templates from `JSON_TEMPLATES.md`
2. Run the integration script:
   ```bash
   python scripts/add-dataset.py --json-file data/static/your-dataset.json --chart-id your-chart-id
   ```
3. Test locally: `python -m http.server 8000`

## 📋 Data Format Summary

### Required JSON Fields
```json
{
  "title": "Dataset Title",
  "description": "Brief description",
  "source": "Data Source Name",
  "source_url": "https://example.com/source",
  "unit": "Unit of measurement",
  "data": [
    {"year": 2023, "value": 123.45}
  ]
}
```

### Supported Data Types
- **Annual data**: Use `year` field
- **Monthly/Quarterly data**: Use `date` field (YYYY-MM-DD format)
- **Multi-category data**: Include multiple value fields
- **Exchange rates**: Use daily frequency
- **Percentages/Indices**: Use appropriate units

## 🔍 Validation Checklist

Before submitting your data:
- [ ] JSON syntax is valid
- [ ] All required fields are present
- [ ] Data is in chronological order
- [ ] At least 2 data points included
- [ ] Source attribution is complete
- [ ] Units are clearly specified

## 🛠️ Tools and Resources

### JSON Validation
- [JSONLint](https://jsonlint.com/) - Online JSON validator
- [JSON Schema Validator](https://www.jsonschemavalidator.net/) - Schema validation

### Testing
- Local server: `python -m http.server 8000`
- Browser: `http://localhost:8000`
- Debug: `http://localhost:8000/tests/debug-cache.html`

## 📞 Need Help?

1. Check the comprehensive guide in `DATA_FORMAT_GUIDE.md`
2. Use templates from `JSON_TEMPLATES.md`
3. Look at existing examples in `data/cached/` and `data/static/`
4. Run the automated integration script for error-free setup

## 🎨 Chart Features

Your data will automatically get:
- Political period coloring (Norwegian government periods)
- Responsive design (mobile-friendly)
- Interactive tooltips
- Download/copy functionality
- Light/dark mode support
- Modern, minimalist styling
