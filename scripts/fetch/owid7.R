# --- packages ---
library(jsonlite)

# --- OWID API URLs (CO2 per capita) ---
data_url <- "https://ourworldindata.org/grapher/co-emissions-per-capita.csv?v=1&csvType=full&useColumnShortNames=true"
meta_url <- "https://ourworldindata.org/grapher/co-emissions-per-capita.metadata.json?v=1&csvType=full&useColumnShortNames=true"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)   # preserve original header
metadata <- jsonlite::fromJSON(meta_url)

# --- identify value column robustly ---
# Known short name: emissions_total_per_capita
candidates <- setdiff(names(df), c("Entity", "Code", "Year"))
# drop helper/annotation columns
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

if ("emissions_total_per_capita" %in% names(df)) {
  value_col <- "emissions_total_per_capita"
} else {
  # fallback: first numeric candidate
  num_flags <- vapply(df[candidates], is.numeric, logical(1))
  num_candidates <- candidates[num_flags]
  if (length(num_candidates) == 0) stop("No numeric value column found among: ", paste(candidates, collapse = ", "))
  value_col <- num_candidates[1]
}

# --- Norway only, tidy, sort ---
norway_df <- subset(df, Entity == "Norway", select = c("Entity", "Code", "Year", value_col))
names(norway_df)[names(norway_df) == value_col] <- "value"
norway_df <- norway_df[order(norway_df$Year), ]

# --- compact metadata & citation ---
`%||%` <- function(a, b) if (!is.null(a)) a else b

citation_text <- paste(
  "Data sources: Global Carbon Budget (2024); Population based on various sources (2024) ???",
  "with major processing by Our World in Data.",
  "Please credit all sources listed above. Data provided by third-party sources through",
  "Our World in Data remains subject to the original providers' license terms."
)

meta_compact <- list(
  title       = metadata$title %||% "CO??? emissions per capita",
  variable    = value_col,
  unit        = metadata$unit %||% "tonnes per person",
  description = metadata$description %||% NULL,
  owidTags    = metadata$owidTags %||% NULL,
  dataPublishedBy    = metadata$dataPublishedBy %||% NULL,
  dataPublisherSource = metadata$dataPublisherSource %||% NULL,
  lastUpdated = metadata$lastUpdated %||% NULL,
  retrieved   = as.character(Sys.Date()),
  source_and_citation = citation_text
)

out <- list(
  dataset = "co-emissions-per-capita",
  country = "Norway",
  metadata = meta_compact,
  data = norway_df
)

# --- write JSON (UTF-8) ---
jsonlite::write_json(out, "norway_co2_per_capita.json", pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_co2_per_capita_records.json", pretty = TRUE, auto_unbox = TRUE)

cat("Wrote:\n - norway_co2_per_capita.json\n - norway_co2_per_capita_records.json\n")
