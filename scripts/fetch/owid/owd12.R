# --- packages ---
library(jsonlite)

# --- OWID API URLs (Daily per capita caloric supply, filtered to Norway) ---
data_url <- "https://ourworldindata.org/grapher/daily-per-capita-caloric-supply.csv?v=1&csvType=filtered&useColumnShortNames=true&country=~NOR"
meta_url <- "https://ourworldindata.org/grapher/daily-per-capita-caloric-supply.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&country=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)   # preserve original header
metadata <- jsonlite::fromJSON(meta_url)

# --- identify value column robustly ---
# Common short name on OWID: "daily_calories"
candidates <- setdiff(names(df), c("Entity", "Code", "Year"))
# drop helper/annotation columns
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

if ("daily_calories" %in% names(df)) {
  value_col <- "daily_calories"
} else {
  # fallback: first numeric candidate
  num_flags <- vapply(df[candidates], is.numeric, logical(1))
  num_candidates <- candidates[num_flags]
  if (length(num_candidates) == 0) stop("No numeric value column found among: ", paste(candidates, collapse = ", "))
  value_col <- num_candidates[1]
}

# --- Norway only (filtered endpoint already does this), tidy, sort ---
norway_df <- subset(df, Entity == "Norway", select = c("Entity", "Code", "Year", value_col))
names(norway_df)[names(norway_df) == value_col] <- "value"
norway_df <- norway_df[order(norway_df$Year), ]

# --- compact metadata & citation ---
`%||%` <- function(a, b) if (!is.null(a)) a else b

citation_text <- paste(
  "Data sources: Food and Agriculture Organization of the United Nations (2024);",
  "Harris et al. (2015); Floud et al. (2011); Jonsson (1998); Grigg (1995); Fogel (2004);",
  "FAO (2000, 1949); USDA ERS (2015) ??? with major processing by Our World in Data.",
  "Please credit all sources listed above. Data provided by third-party sources through",
  "Our World in Data remains subject to the original providers' license terms."
)

meta_compact <- list(
  title       = metadata$title %||% "Daily supply of calories per person",
  variable    = value_col,
  unit        = metadata$unit %||% "kilocalories per day",
  description = metadata$description %||% NULL,
  owidTags    = metadata$owidTags %||% NULL,
  dataPublishedBy    = metadata$dataPublishedBy %||% NULL,
  dataPublisherSource = metadata$dataPublisherSource %||% NULL,
  lastUpdated = metadata$lastUpdated %||% NULL,
  retrieved   = as.character(Sys.Date()),
  source_and_citation = citation_text
)

# --- assemble output ---
out <- list(
  dataset = "daily-per-capita-caloric-supply",
  country = "Norway",
  metadata = meta_compact,
  data = norway_df
)

# --- write JSON (UTF-8) ---
jsonlite::write_json(out, "norway_daily_calories.json", pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_daily_calories_records.json", pretty = TRUE, auto_unbox = TRUE)

cat("Wrote:\n - norway_daily_calories.json\n - norway_daily_calories_records.json\n")
