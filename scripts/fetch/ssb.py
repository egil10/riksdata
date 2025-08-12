#!/usr/bin/env python3
"""
SSB Data Fetcher
Fetches data from Statistics Norway (SSB) API
"""

import logging
from .base import BaseFetcher

class SSBFetcher(BaseFetcher):
    def __init__(self, cache_dir):
        super().__init__(cache_dir / "ssb")
        self.base_url = "https://data.ssb.no/api/v0/dataset"
        
        # Priority datasets with their IDs and names
        self.datasets = [
            {"id": "1086", "name": "cpi", "title": "Consumer Price Index"},
            {"id": "1054", "name": "unemployment", "title": "Unemployment Rate"},
            {"id": "1060", "name": "house-prices", "title": "House Price Index"},
            {"id": "1124", "name": "wage", "title": "Wage Index"},
            {"id": "59012", "name": "gdp-growth", "title": "GDP Growth"},
            {"id": "58962", "name": "trade-balance", "title": "Trade Balance"},
            {"id": "95265", "name": "bankruptcies", "title": "Bankruptcies"},
            {"id": "49626", "name": "population-growth", "title": "Population Growth"},
            {"id": "26944", "name": "construction-costs", "title": "Construction Costs"},
            {"id": "27002", "name": "industrial-production", "title": "Industrial Production"},
            {"id": "1064", "name": "retail-sales", "title": "Retail Sales"},
            {"id": "179421", "name": "export-volume", "title": "Export Volume"},
            {"id": "179422", "name": "import-volume", "title": "Import Volume"},
            {"id": "166316", "name": "business-confidence", "title": "Business Confidence"},
            {"id": "166330", "name": "consumer-confidence", "title": "Consumer Confidence"},
            {"id": "95146", "name": "housing-starts", "title": "Housing Starts"},
            {"id": "172769", "name": "monetary-aggregates", "title": "Monetary Aggregates"},
            {"id": "166328", "name": "job-vacancies", "title": "Job Vacancies"},
            {"id": "166331", "name": "household-consumption", "title": "Household Consumption"},
            {"id": "26427", "name": "producer-prices", "title": "Producer Prices"},
            {"id": "924808", "name": "construction-production", "title": "Construction Production"},
            {"id": "166326", "name": "credit-indicator", "title": "Credit Indicator"},
            {"id": "928196", "name": "energy-consumption", "title": "Energy Consumption"},
            {"id": "928194", "name": "government-revenue", "title": "Government Revenue"},
            {"id": "924820", "name": "international-accounts", "title": "International Accounts"},
            {"id": "760065", "name": "labour-cost-index", "title": "Labour Cost Index"},
            {"id": "61819", "name": "rd-expenditure", "title": "R&D Expenditure"},
            {"id": "1122", "name": "salmon-export", "title": "Salmon Export Value"},
            {"id": "166334", "name": "oil-gas-investment", "title": "Oil & Gas Investment"},
            {"id": "48651", "name": "immigration-rate", "title": "Immigration Rate"},
            {"id": "56900", "name": "household-income", "title": "Household Income"},
            {"id": "102811", "name": "life-expectancy", "title": "Life Expectancy"},
            {"id": "97445", "name": "crime-rate", "title": "Crime Rate"},
            {"id": "85454", "name": "education-level", "title": "Education Level"},
            {"id": "65962", "name": "holiday-property-sales", "title": "Holiday Property Sales"},
            {"id": "832678", "name": "greenhouse-gas", "title": "Greenhouse Gas Emissions"},
            {"id": "934513", "name": "economic-forecasts", "title": "Economic Forecasts"},
            {"id": "26158", "name": "new-dwellings-price", "title": "New Dwellings Price"},
            {"id": "832683", "name": "lifestyle-habits", "title": "Lifestyle Habits"},
            {"id": "832685", "name": "long-term-illness", "title": "Long-term Illness"},
            {"id": "1104", "name": "population-growth-alt", "title": "Population Growth Alt"},
            {"id": "1106", "name": "births-deaths", "title": "Births and Deaths"},
            {"id": "1118", "name": "cpi-ate", "title": "CPI-ATE Index"},
            {"id": "1120", "name": "salmon-export-volume", "title": "Salmon Export Volume"},
            {"id": "1126", "name": "basic-salary", "title": "Basic Salary Index"},
            {"id": "1130", "name": "export-country", "title": "Export by Country"},
            {"id": "1132", "name": "import-country", "title": "Import by Country"},
            {"id": "1134", "name": "export-commodity", "title": "Export by Commodity"},
            {"id": "1140", "name": "import-commodity", "title": "Import by Commodity"},
            {"id": "1056", "name": "construction-cost-wood", "title": "Construction Cost Wood"},
            {"id": "1058", "name": "construction-cost-multi", "title": "Construction Cost Multi"},
            {"id": "1065", "name": "wholesale-retail", "title": "Wholesale Retail Sales"},
            {"id": "1068", "name": "household-types", "title": "Household Types"},
            {"id": "1074", "name": "population-age", "title": "Population by Age"},
            {"id": "1084", "name": "cpi-coicop", "title": "CPI Coicop Divisions"},
            {"id": "1090", "name": "cpi-subgroups", "title": "CPI Sub-groups"},
            {"id": "1096", "name": "cpi-items", "title": "CPI Items"},
            {"id": "1100", "name": "cpi-delivery", "title": "CPI Delivery Sectors"},
            {"id": "56957", "name": "household-income-size", "title": "Household Income Size"},
            {"id": "85440", "name": "cohabiting-arrangements", "title": "Cohabiting Arrangements"},
            {"id": "95177", "name": "utility-floor-space", "title": "Utility Floor Space"},
            {"id": "166327", "name": "credit-indicator-c2", "title": "Credit Indicator C2"},
            {"id": "166329", "name": "job-vacancies-new", "title": "Job Vacancies New"},
            {"id": "124322", "name": "oil-gas-turnover", "title": "Oil Gas Turnover"},
            {"id": "179415", "name": "trade-volume-price", "title": "Trade Volume Price"},
            {"id": "741023", "name": "producer-price-industry", "title": "Producer Price Industry"},
            {"id": "567324", "name": "deaths-age", "title": "Deaths by Age"},
            {"id": "924809", "name": "construction-production-alt", "title": "Construction Production Alt"},
            {"id": "924816", "name": "bankruptcies-total", "title": "Bankruptcies Total"},
            {"id": "928197", "name": "energy-accounts", "title": "Energy Accounts"},
            {"id": "172793", "name": "monetary-m3", "title": "Monetary Aggregate M3"},
            {"id": "25139", "name": "new-dwellings-price-alt", "title": "New Dwellings Price Alt"},
            {"id": "166317", "name": "business-tendency", "title": "Business Tendency Survey"}
        ]
    
    def fetch_all(self):
        """Fetch all SSB datasets"""
        logging.info(f"Fetching {len(self.datasets)} SSB datasets...")
        
        successful_fetches = 0
        failed_fetches = 0
        
        for dataset in self.datasets:
            try:
                url = f"{self.base_url}/{dataset['id']}.json?lang=en"
                data = self.fetch_with_retry(url)
                
                # Add metadata
                data = self.add_metadata(data, 'SSB', dataset['title'], url)
                
                filename = f"{dataset['name']}.json"
                self.save_data(data, filename)
                successful_fetches += 1
                
            except Exception as e:
                logging.error(f"Failed to fetch SSB dataset {dataset['id']}: {e}")
                failed_fetches += 1
                
                # If we're getting too many failures, stop to avoid overwhelming the API
                if failed_fetches > 10:
                    logging.warning("Too many failures, stopping SSB fetch to avoid rate limiting")
                    break
        
        logging.info(f"SSB fetch completed: {successful_fetches} successful, {failed_fetches} failed")
        return successful_fetches, failed_fetches
