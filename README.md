# Riksklokken

A modern, interactive dashboard displaying Norwegian economic indicators with political party period shading. Built with cutting-edge web technologies and inspired by industry standards like Tableau and Google Data Studio.

## Features

- **24 Economic Indicators**: CPI, Unemployment, House Prices, Producer Prices, Wages, Oil Fund, Exchange Rates (USD/NOK, EUR/NOK), Interest Rates, Government Debt, GDP Growth, Trade Balance, Bankruptcies, Population Growth, Construction Costs, Industrial Production, Retail Sales, Export Volume, Import Volume, Employment Rate, Business Confidence, Consumer Confidence, Housing Starts, Oil Price (Brent)
- **Interactive Political Period Coloring**: Chart lines colored by ruling party periods since 2000 with collapsible legend
- **Modern Design System**: Inter font, CSS variables, and neumorphic design patterns
- **Enhanced Tooltips**: Rich formatting with political period context and proper date formatting
- **Interactive Filters**: Time range and party focus controls for dynamic data exploration
- **Skeleton Loading**: Modern loading states with smooth animations
- **Responsive Grid Layout**: 3-column desktop grid that adapts to mobile
- **Mixed Chart Types**: Optimized line and bar charts for better data storytelling
- **Real-time Data**: Fetches data from SSB and Norges Bank APIs
- **Accessibility**: WCAG AA compliant color scheme and typography
- **Static Hosting**: Ready for GitHub Pages deployment

## Political Periods (Post-2000)

The charts include background shading for the following Norwegian government periods as such:

- **Jens Stoltenberg I (Ap)**: March 17, 2000 - October 19, 2001
- **Kjell Magne Bondevik II (KrF, H, V)**: October 19, 2001 - October 17, 2005
- **Jens Stoltenberg II (Ap, SV, Sp)**: October 17, 2005 - October 16, 2013
- **Erna Solberg (H, FrP; later V, KrF)**: October 16, 2013 - October 14, 2021
- **Jonas Gahr Støre (Ap, Sp)**: October 14, 2021 - September 8, 2025 (Next Election)

## Modern Design Features

### Typography & Layout
- **Inter Font**: Modern sans-serif typography for optimal readability
- **CSS Variables**: Consistent color scheme and spacing system
- **Responsive Grid**: 3-column desktop layout with mobile-first approach
- **Rem Units**: Scalable typography and spacing

### Interactive Elements
- **Enhanced Tooltips**: Rich formatting with political context
- **Collapsible Legend**: Space-efficient political period legend
- **Filter Controls**: Time range and party focus selectors
- **Smooth Animations**: Chart transitions and hover effects

### Loading Experience
- **Skeleton Loading**: Modern loading states for better perceived performance
- **Progressive Loading**: Charts load in parallel with smooth transitions
- **Error Handling**: Graceful fallbacks for failed data requests

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
- **Industrial Production**: Dataset 1087 from SSB (Manufacturing and mining)
- **Retail Sales**: Dataset 1088 from SSB (Retail trade volume)
- **Export Volume**: Dataset 1089 from SSB (Export volume index)
- **Import Volume**: Dataset 1090 from SSB (Import volume index)
- **Employment Rate**: Dataset 1055 from SSB (Employment rate)
- **Business Confidence**: Dataset 1091 from SSB (Business tendency survey)
- **Consumer Confidence**: Dataset 1092 from SSB (Consumer confidence survey)
- **Housing Starts**: Dataset 1093 from SSB (Building permits and starts)
- **Oil Price (Brent)**: Dataset 1094 from SSB (Brent crude oil price)

### Norges Bank
- **Exchange Rates**: USD/NOK and EUR/NOK exchange rates from Norges Bank API
- **Interest Rates**: Key Policy Rate from Norges Bank API
- **Government Debt**: Government debt as % of GDP from Norges Bank API

### Local Data
- **Oil Fund**: Government Pension Fund Global value (annual data)

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/egil10/riksdata.git
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
   - Your site will be available at `https://egil10.github.io/riksdata/`

## Project Structure

```
riksdata/
├── index.html              # Main HTML page with modern structure
├── style.css               # Modern CSS with Inter font and variables
├── scripts.js              # Enhanced JavaScript with interactive features
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
           <div class="skeleton-chart" id="new-chart-skeleton"></div>
           <canvas id="new-chart"></canvas>
           <a href="https://data.ssb.no/api/v0/dataset/XXXX.json?lang=en" target="_blank" class="source-link">SSB XXXX</a>
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

## Chart Types & Optimization

The dashboard uses optimized chart types for better data storytelling:

- **Line Charts**: Continuous time series data (CPI, Unemployment, Exchange Rate)
- **Bar Charts**: Discrete data points (GDP Growth, Trade Balance, Bankruptcies)
- **Enhanced Tooltips**: Political period context and rich formatting
- **Smooth Animations**: Chart transitions with easing functions

## Interactive Features

### Filter Controls
- **Time Range**: All Data, Last 5 Years, Post-2010, Current Period
- **Party Focus**: All Parties, Arbeiderpartiet (Ap), Kristelig Folkeparti (KrF), Høyre (H)

### Legend System
- **Collapsible Legend**: Space-efficient political period display
- **Color Coding**: Modern, accessible color palette
- **Interactive Toggle**: Expand/collapse functionality

## Design System

### Color Palette
- **Primary Colors**: Modern red (#EF4444), blue (#3B82F6), green (#10B981)
- **Neutral Colors**: Gray scale with proper contrast ratios
- **Background**: Light neutral (#F9FAFB) for optimal readability

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Base Size**: 16px for optimal readability
- **Weights**: 300-700 for proper hierarchy
- **Line Height**: 1.5 for comfortable reading

### Spacing & Layout
- **Grid System**: CSS Grid with responsive breakpoints
- **Spacing Scale**: Rem-based system for consistency
- **Card Design**: Neumorphic shadows and subtle borders

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

- **Chart.js**: Chart rendering library with enhanced configurations
- **chartjs-adapter-date-fns**: Date handling for Chart.js
- **Inter Font**: Modern typography from Google Fonts

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