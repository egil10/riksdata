# Norway Macro Dashboard

A static GitHub Pages website displaying Norwegian economic indicators with political party period shading. The dashboard fetches data from Statistics Norway (SSB) APIs and visualizes it using Chart.js with background shading for different ruling party periods.

## Features

- **14 Economic Indicators**: CPI, Unemployment, House Prices, Producer Prices, Wages, Oil Fund, Exchange Rates, Interest Rates, Government Debt, GDP Growth, Trade Balance, Bankruptcies, Population Growth, Construction Costs
- **Political Period Coloring**: Chart lines colored by ruling party periods since 2000
- **Ultra-Compact Design**: Space-efficient layout optimized for multiple charts with reduced heights
- **Modern Loading Screen**: Elegant loading experience with spinner and fade transitions
- **Mixed Chart Types**: Line charts for trends, bar charts for discrete data
- **Real-time Data**: Fetches data from SSB and Norges Bank APIs
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Static Hosting**: Ready for GitHub Pages deployment

## Political Periods (Post-2000)

The charts include background shading for the following Norwegian government periods:

- **Jens Stoltenberg I (Ap)**: March 17, 2000 - October 19, 2001
- **Kjell Magne Bondevik II (KrF, H, V)**: October 19, 2001 - October 17, 2005
- **Jens Stoltenberg II (Ap, SV, Sp)**: October 17, 2005 - October 16, 2013
- **Erna Solberg (H, FrP; later V, KrF)**: October 16, 2013 - October 14, 2021
- **Jonas Gahr Støre (Ap, Sp)**: October 14, 2021 - September 8, 2025 (Next Election)

## Data Sources

### SSB (Statistics Norway)
- **Consumer Price Index (CPI)**: Dataset 1086 from SSB
- **Unemployment Rate**: Dataset 1054 from SSB (Labour Force Survey)
- **House Price Index**: Dataset 1060 from SSB (Quarterly data)
- **Producer Price Index**: Dataset 26426 from SSB (Oil, gas, manufacturing, mining, electricity)
- **Wage Index**: Dataset 1124 from SSB (Average monthly earnings by industry)
- **GDP Growth**: Dataset 59012 from SSB (National accounts)
- **Trade Balance**: Dataset 58962 from SSB (External trade)
- **Bankruptcies**: Dataset 95265 from SSB (Monthly bankruptcies)
- **Population Growth**: Dataset 49626 from SSB (Population changes)
- **Construction Costs**: Dataset 26944 from SSB (Construction cost index)

### Norges Bank
- **Exchange Rates**: USD/NOK exchange rate from Norges Bank API
- **Interest Rates**: Key Policy Rate from Norges Bank API
- **Government Debt**: Government debt as % of GDP from Norges Bank API

### Local Data
- **Oil Fund**: Government Pension Fund Global value (annual data)

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/riksdata.git
   cd riksdata
   ```

2. **Open the site**:
   - Open `index.html` in your web browser
   - Or serve it locally: `python -m http.server 8000` then visit `http://localhost:8000/`

3. **Deploy to GitHub Pages**:
   - Push to the `main` branch
   - Go to Settings > Pages
   - Set Source to "Deploy from a branch"
   - Select "main" branch and "/(root)" folder
   - Your site will be available at `https://yourusername.github.io/riksdata/`

## Project Structure

```
riksdata/
├── index.html              # Main HTML page with 14 charts
├── style.css               # Modern responsive CSS styles
├── scripts.js              # JavaScript with SSB API integration
├── data/                   # Local data files
│   ├── oil-fund.json       # Oil fund data
│   └── exchange-rates.json # Exchange rate data
├── test-api.html           # API test page
└── README.md               # This file
```

## Adding New Datasets

To add a new economic indicator:

1. **Add a new chart section** in `index.html`:
   ```html
   <div class="chart-card">
       <div class="chart-header">
           <h3>Your New Dataset</h3>
           <span class="chart-subtitle">Description</span>
       </div>
       <div class="chart-container">
           <canvas id="new-chart"></canvas>
       </div>
   </div>
   ```

2. **Add the chart initialization** in `scripts.js`:
   ```javascript
   // In the initializeCharts() function:
   loadChartData('new-chart', 'https://data.ssb.no/api/v0/dataset/XXXX.json?lang=en', 'Your Dataset Name', 'line');
   ```

3. **Find the correct SSB dataset ID**:
   - Visit [SSB PXWeb](https://www.ssb.no/en/statbank)
   - Search for your dataset
   - Use the dataset ID in the API URL

## Chart Types

The dashboard supports different chart types based on data characteristics:

- **Line Charts**: Used for continuous time series data (CPI, Unemployment, etc.)
- **Bar Charts**: Used for discrete data points (GDP Growth, Trade Balance, Bankruptcies)

## SSB API Format

The dashboard expects SSB data in PXWeb JSON format. The parsing function handles:
- Monthly data (format: "2023M01")
- Yearly data (format: "2023")
- Time dimension with ID "Tid"
- Value arrays indexed by time periods

## Customization

### Political Party Colors

Edit the `POLITICAL_PERIODS` array in `scripts.js`:
```javascript
const POLITICAL_PERIODS = [
    {
        name: "Party Name",
        start: "YYYY-MM-DD",
        end: "YYYY-MM-DD",
        color: "rgba(R, G, B, 0.1)",      # Background color
        backgroundColor: "rgba(R, G, B, 0.1)" # Border color
    }
];
```

### Chart Styling

Modify the `CHART_CONFIG` object in `scripts.js` to customize:
- Chart colors and styling
- Tooltip appearance
- Axis formatting
- Responsive behavior

### CSS Customization

Edit `style.css` to change:
- Color scheme
- Layout and spacing
- Typography
- Mobile responsiveness

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- **Chart.js**: Chart rendering library
- **chartjs-adapter-date-fns**: Date handling for Chart.js

All dependencies are loaded from CDN for simplicity.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Data Attribution

All economic data is sourced from [Statistics Norway (SSB)](https://www.ssb.no/), the official statistics agency of Norway. Please refer to their terms of use for data usage guidelines.