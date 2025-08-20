library(httr)
library(jsonlite)
library(dplyr)
library(lubridate)

# Test request to inspect response structure
test_url <- "https://biapi.nve.no/magasinstatistikk/api/Magasinstatistikk/HentOffentligData?per_page=1"
test_response <- GET(test_url)
if (status_code(test_response) != 200) {
  stop("Test request failed. Status: ", status_code(test_response))
}
test_data <- fromJSON(content(test_response, as = "text", encoding = "UTF-8"))
cat("Test response structure:\n", toJSON(test_data, pretty = TRUE), "\n")

# Fetch reservoir data
url <- "https://biapi.nve.no/magasinstatistikk/api/Magasinstatistikk/HentOffentligData"
response <- GET(url)
if (status_code(response) != 200) {
  stop("Failed to fetch data. Status: ", status_code(response))
}
data <- fromJSON(content(response, as = "text", encoding = "UTF-8"))

# Process and filter for national data (omrnr=0, omrType=NO)
data_df <- data %>%
  filter(omrnr == 0, omrType == "NO") %>%
  mutate(
    date = as.Date(dato_Id, format = "%Y-%m-%d"), # Use as.Date for YYYY-MM-DD
    year = year(date),
    fill_percentage = as.numeric(fyllingsgrad) * 100 # Convert to percentage
  ) %>%
  group_by(year) %>%
  summarise(value = mean(fill_percentage, na.rm = TRUE)) %>%
  filter(year >= 2012 & year <= 2024)

# Check if data is empty
if (nrow(data_df) == 0) {
  stop("No national data found for omrnr=0, omrType=NO. Check API response.")
}

# Create JSON structure (Template 1)
json_data <- list(
  title = "Norway Annual Reservoir Fill",
  description = "Annual average reservoir fill percentage in Norway, 2012-2024",
  source = "NVE Magasinstatistikk API",
  source_url = "https://biapi.nve.no/magasinstatistikk/api/Magasinstatistikk/HentOffentligData",
  unit = "Percent",
  data = lapply(1:nrow(data_df), function(i) list(
    year = data_df$year[i],
    value = round(data_df$value[i], 2)
  ))
)

# Write to JSON file
write_json(json_data, "../data/static/nve-reservoir-fill.json", pretty = TRUE, auto_unbox = TRUE)

cat("Data saved to data/static/nve-reservoir-fill.json\n")
