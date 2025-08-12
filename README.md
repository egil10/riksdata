# Riksklokken

A modern, interactive dashboard displaying Norwegian economic indicators with political party period shading. Built with cutting-edge web technologies and inspired by industry standards like Tableau and Google Data Studio.

## Features

- **75 Economic Indicators**: CPI, Unemployment, House Prices, Producer Prices, Wages, Oil Fund, Exchange Rates (USD/NOK, EUR/NOK), Interest Rates, Government Debt, GDP Growth, Trade Balance, Bankruptcies, Population Growth, Construction Costs, Industrial Production, Retail Sales, Export Volume, Import Volume, Employment Rate, Business Confidence, Consumer Confidence, Housing Starts, Oil Price (Brent), Monetary Aggregates, Job Vacancies, Household Consumption, Producer Prices, Construction Production, Credit Indicator, Energy Consumption, Government Revenue, International Accounts, Labour Cost Index, R&D Expenditure, Salmon Export Value, Oil & Gas Investment, Immigration Rate, Household Income, Life Expectancy, Crime Rate, Education Level, Holiday Property Sales, Greenhouse Gas Emissions, Economic Forecasts, New Dwellings Price, Lifestyle Habits, Long-term Illness, Population Growth, Births and Deaths, CPI-ATE Index, Salmon Export Volume, Basic Salary Index, Export by Country, Import by Country, Export by Commodity, Import by Commodity, Construction Cost Wood, Construction Cost Multi, Wholesale Retail Sales, Household Types, Population by Age, CPI Coicop Divisions, CPI Sub-groups, CPI Items, CPI Delivery Sectors, Household Income Size, Cohabiting Arrangements, Utility Floor Space, Credit Indicator C2, Job Vacancies, Oil Gas Turnover, Trade Volume Price, Producer Price Industry, Deaths by Age, Construction Production, Bankruptcies Total, Energy Accounts, Monetary Aggregate M3, New Dwellings Price, Business Tendency Survey
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
       - **Oil Price (Brent)**: Dataset 26426 from SSB (Producer price index for oil and gas)
       - **Monetary Aggregates**: Dataset 172769 from SSB (M1, M2, M3 monetary aggregates)
       - **Job Vacancies**: Dataset 166328 from SSB (Job vacancies by industry)
       - **Household Consumption**: Dataset 166330 from SSB (Household consumption of goods)
       - **Producer Prices**: Dataset 26426 from SSB (Producer price index)
       - **Construction Production**: Dataset 924808 from SSB (Production index for construction)
       - **Credit Indicator**: Dataset 166326 from SSB (Domestic loan debt)
       - **Energy Consumption**: Dataset 928196 from SSB (Energy accounts)
       - **Government Revenue**: Dataset 928194 from SSB (General government revenue)
       - **International Accounts**: Dataset 924820 from SSB (Current and capital account)
       - **Labour Cost Index**: Dataset 760065 from SSB (Labour cost index by section)
       - **R&D Expenditure**: Dataset 61819 from SSB (R&D personnel and expenditure)
       - **Salmon Export Value**: Dataset 1122 from SSB (Export of salmon, fresh and frozen)
       - **Oil & Gas Investment**: Dataset 166334 from SSB (Oil and gas extraction investments)
       - **Immigration Rate**: Dataset 48651 from SSB (Immigrants by country background)
       - **Household Income**: Dataset 56900 from SSB (Income by type of household)
       - **Life Expectancy**: Dataset 102811 from SSB (Life tables by sex and age)
       - **Crime Rate**: Dataset 97445 from SSB (Offences reported to police)
       - **Education Level**: Dataset 85454 from SSB (Education level by sex)
       - **Holiday Property Sales**: Dataset 65962 from SSB (Transfers of holiday properties)
       - **Greenhouse Gas Emissions**: Dataset 832678 from SSB (Greenhouse gases by source)
       - **Economic Forecasts**: Dataset 934513 from SSB (Economic trends and forecasts)
       - **New Dwellings Price**: Dataset 26158 from SSB (Price index for new dwellings)
       - **Lifestyle Habits**: Dataset 832683 from SSB (Lifestyle habits by sex and age)
               - **Long-term Illness**: Dataset 832685 from SSB (Long-term illness by sex and age)
        - **Population Growth**: Dataset 1104 from SSB (Population change, whole country)
        - **Births and Deaths**: Dataset 1106 from SSB (Population changes, municipalities)
        - **CPI-ATE Index**: Dataset 1118 from SSB (Consumer Price index, CPI-AT and CPI-ATE)
        - **Salmon Export Volume**: Dataset 1120 from SSB (Export of salmon, fresh and frozen)
        - **Basic Salary Index**: Dataset 1126 from SSB (Wage index, average monthly basic salary)
        - **Export by Country**: Dataset 1130 from SSB (Export of goods, value by country)
        - **Import by Country**: Dataset 1132 from SSB (Import of goods, value by country)
        - **Export by Commodity**: Dataset 1134 from SSB (Export of goods, by commodity group)
        - **Import by Commodity**: Dataset 1140 from SSB (Import of goods, by commodity group)
        - **Construction Cost Wood**: Dataset 1056 from SSB (Construction cost index for detached houses of wood)
        - **Construction Cost Multi**: Dataset 1058 from SSB (Construction cost index for multi dwelling houses)
        - **Wholesale Retail Sales**: Dataset 1064 from SSB (Index of wholesale and retail sales)
        - **Household Types**: Dataset 1068 from SSB (Households, by type)
        - **Population by Age**: Dataset 1074 from SSB (Population, by one-year age groups)
        - **CPI Coicop Divisions**: Dataset 1084 from SSB (Consumer Price Index - Coicop divisions)
        - **CPI Sub-groups**: Dataset 1090 from SSB (Consumer Price Index - sub-groups 1)
        - **CPI Items**: Dataset 1096 from SSB (Consumer Price Index - items and itemgroups)
        - **CPI Delivery Sectors**: Dataset 1100 from SSB (Consumer Price Index for goods and services by delivery sector)
        - **Household Income Size**: Dataset 56957 from SSB (Households, by size of after tax income)
        - **Cohabiting Arrangements**: Dataset 85440 from SSB (Persons 18 years and over, by cohabiting arrangements)
        - **Utility Floor Space**: Dataset 95177 from SSB (Utility floor space other than in dwellings)
        - **Credit Indicator C2**: Dataset 166326 from SSB (Credit indicator C2, domestic loan debt)
        - **Job Vacancies**: Dataset 166328 from SSB (Job vacancies, by major industry division)
        - **Oil Gas Turnover**: Dataset 124322 from SSB (Oil and gas extraction, manufacturing, mining and quarrying turnover)
        - **Trade Volume Price**: Dataset 179415 from SSB (External trade in commodities, indices of volume and price)
        - **Producer Price Industry**: Dataset 741023 from SSB (Producer price index, industry combined)
        - **Deaths by Age**: Dataset 567324 from SSB (Deaths, by sex and one-year age groups)
        - **Construction Production**: Dataset 924808 from SSB (Production index for construction)
        - **Bankruptcies Total**: Dataset 924816 from SSB (Bankruptcies, total)
        - **Energy Accounts**: Dataset 928196 from SSB (Energy accounts, production and consumption)
        - **Monetary Aggregate M3**: Dataset 172793 from SSB (Monetary aggregate M3, by financial instrument)
        - **New Dwellings Price**: Dataset 25138 from SSB (Prices per square meter new detached houses)
        - **Business Tendency Survey**: Dataset 166316 from SSB (Business tendency survey, composite indicators)
        
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