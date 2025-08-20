library(httr)
library(jsonlite)
library(dplyr)
library(lubridate)

# Fetch data from Statnett API
url <- "https://driftsdata.statnett.no/restapi/ProductionConsumption/GetData?From=2012-01-01"
response <- GET(url)
data <- fromJSON(content(response, as = "text", encoding = "UTF-8"))

# Extract timestamps and data
start_utc <- as.numeric(data$StartPointUTC) / 1000
period_ms <- as.numeric(data$PeriodTickMs) / 1000
consumption <- as.numeric(data$Consumption)
production <- as.numeric(data$Production)

# Create date sequence
dates <- seq(from = as.POSIXct(start_utc, origin = "1970-01-01", tz = "UTC"), 
             by = period_ms, length.out = length(consumption))

# Build data frame
data_df <- data.frame(
  date = dates,
  year = year(dates),
  consumption = consumption,
  production = production
)

# Aggregate by year
annual_data <- data_df %>%
  group_by(year) %>%
  summarise(
    consumption = sum(consumption, na.rm = TRUE),
    production = sum(production, na.rm = TRUE),
    net = production - consumption
  )

# Create JSON structure
json_data <- list(
  title = "Norway Electricity Production and Consumption",
  description = "Annual electricity production and consumption in Norway from 2012 onwards",
  source = "Statnett",
  source_url = "https://driftsdata.statnett.no/restapi/ProductionConsumption/GetData?From=2012-01-01",
  unit = "MWh",
  data = annual_data %>%
    rename(
      consumption = consumption,
      production = production,
      net = net
    ) %>%
    as.list()
)

# Write to JSON file in main repo directory
write_json(json_data, "production-consumption.json", pretty = TRUE, auto_unbox = TRUE)

cat("Data saved to production-consumption.json\n")