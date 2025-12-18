# Riksdata

Riksdata is a modern, high-performance economic and social data dashboard for Norway. It provides interactive visualizations for over 120 datasets sourced from Statistics Norway (SSB), Norges Bank, NVE, Statnett, DFO, and Our World in Data.

The official live version is available at [riksdata.no](https://riksdata.no).

## Project Mission

The objective of Riksdata is to provide a transparent, accessible, and high-fidelity overview of the Norwegian economy and society. By consolidating disparate data sources into a single, cohesive interface, Riksdata empowers researchers, policymakers, and the public to monitor national trends with precision.

For more information, visit [riksdata.org](https://riksdata.org).

## Architecture

Riksdata is built with a focus on extreme efficiency and a minimal footprint. The application follows a modular approach where the user interface is decoupled from the data layer, allowing for rapid scaling and performance.

### Core Components

- **Modular Logic**: The interface is generated dynamically from a centralized configuration registry.
- **High-Resolution Exports**: Professional-grade chart exports for PNG, PDF (vector-hybrid), and interactive HTML.
- **Flat Scandinavian Design**: A premium, minimal aesthetic focused on readability and data prominence.
- **Political Context**: Integration of historical Norwegian government periods within financial data timelines.

## Data Sources

The platform aggregates data from several primary institutions:

- **Statistics Norway (SSB)**: Real-time economic indicators, demographics, and industrial production via live API integration.
- **Norges Bank**: Monetary policy data, including key interest rates and exchange rate histories.
- **Norwegian Water Resources and Energy Directorate (NVE)**: Reservoir fill levels and energy statistics.
- **Statnett**: National electricity production and consumption monitoring.
- **DFO (Norwegian Agency for Public and Financial Management)**: Detailed government department budget allocations (2014-2024).
- **Our World in Data**: Comparative development statistics, emissions data, and social trends.

## Technical Specifications

### Directory Structure

```text
riksdata/
├── index.html             # Entry point and modular application shell
├── src/                   # Source code
│   ├── js/                # Core application logic
│   │   ├── main.js        # Registry management and rendering pipeline
│   │   ├── charts.js      # Data parsing and Chart.js integration
│   │   ├── utils.js       # Export systems and utility functions
│   │   └── config.js      # Political periods and global constants
│   ├── css/               # Stylesheets
│   │   ├── main.css       # Core layout and component styling
│   │   └── theme.css      # Design system variables
├── data/                  # Data persistence
│   ├── cached/            # Optimized JSON datasets
│   └── static/            # Static reference data
└── docs/                  # Technical documentation
```

### Installation and Local Development

To run the project locally for development purposes:

1. Clone the repository:
   ```bash
   git clone https://github.com/egil10/riksdata.git
   cd riksdata
   ```

2. Serve the directory using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   ```

3. Access the application:
   Navigate to `http://localhost:8000` in your browser.

## Deployment

The project is optimized for deployment via GitHub Pages. The build pipeline ensures that all modular components are correctly resolved and the live site reflects the latest updates to the `main` branch.

## License

This project is licensed under the MIT License.

## Acknowledgments

This platform would not be possible without the open data initiatives from the Norwegian government and international research organizations. We acknowledge the contribution of Statistics Norway, Norges Bank, Statnett, NVE, and Our World in Data in providing the underlying datasets that power this dashboard.

---
Development and maintenance by the Riksdata team.
Official Website: [riksdata.no](https://riksdata.no)
Project Information: [riksdata.org](https://riksdata.org)