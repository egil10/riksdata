library(httr)
library(jsonlite)

# Fetch JSON data
url <- "https://driftsdata.statnett.no/restapi/ProductionConsumption/GetData?From=2012-01-01"
response <- GET(url)
json_data <- content(response, as = "parsed", type = "application/json")

# Extract data
consumption <- unlist(json_data$Consumption)
production <- unlist(json_data$Production)
start_time <- as.POSIXct(json_data$StartPointUTC / 1000, origin = "1970-01-01", tz = "UTC")
period_ms <- json_data$PeriodTickMs
dates <- seq(start_time, by = period_ms / 1000, length.out = length(consumption))

# Create data frame
data <- data.frame(
  Date = as.Date(dates),
  Consumption = consumption,
  Production = production,
  Net = production - consumption
)

# Write to JSON
write_json(data, "production_consumption_net_data.json", pretty = TRUE)