library(httr)
library(jsonlite)

# Define URLs and corresponding output filenames
urls <- list(
  USD = "https://data.norges-bank.no/api/data/EXR/B.USD.NOK.SP?format=sdmx-json&startPeriod=1945-01-01&endPeriod=2025-08-01&locale=no",
  EUR = "https://data.norges-bank.no/api/data/EXR/B.EUR.NOK.SP?format=sdmx-json&startPeriod=1945-01-01&endPeriod=2025-08-01&locale=no",
  GBP = "https://data.norges-bank.no/api/data/EXR/B.GBP.NOK.SP?format=sdmx-json&startPeriod=1945-01-01&endPeriod=2025-08-01&locale=no",
  I44 = "https://data.norges-bank.no/api/data/EXR/B.I44.NOK.SP?format=sdmx-json&startPeriod=1945-01-01&endPeriod=2025-08-01&locale=no",
  CHF = "https://data.norges-bank.no/api/data/EXR/B.CHF.NOK.SP?format=sdmx-json&startPeriod=1945-01-01&endPeriod=2025-08-01&locale=no",
  CNY = "https://data.norges-bank.no/api/data/EXR/B.CNY.NOK.SP?format=sdmx-json&startPeriod=1945-01-01&endPeriod=2025-08-01&locale=no",
  SEK = "https://data.norges-bank.no/api/data/EXR/B.SEK.NOK.SP?format=sdmx-json&startPeriod=1945-01-01&endPeriod=2025-08-01&locale=no"
)

# Function to fetch and save data
fetch_and_save <- function(currency, url) {
  # Fetch data
  response <- GET(url)
  data <- content(response, "text", encoding = "UTF-8")
  
  # Save to JSON file
  filename <- paste0("data/", tolower(currency), ".json")
  write_json(fromJSON(data), filename, pretty = TRUE)
}

# Create data directory if it doesn't exist
if (!dir.exists("data")) {
  dir.create("data")
}

# Fetch and save each series
for (currency in names(urls)) {
  fetch_and_save(currency, urls[[currency]])
}