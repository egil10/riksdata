# --- packages ---
library(jsonlite)

# --- OWID API URLs (UNODC homicide rate) ---
data_url <- "https://ourworldindata.org/grapher/homicide-rate-unodc.csv?v=1&csvType=full&useColumnShortNames=true"
meta_url <- "https://ourworldindata.org/grapher/homicide-rate-unodc.metadata.json?v=1&csvType=full&useColumnShortNames=true"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)  # preserve original header
metadata <- jsonlite::fromJSON(meta_url)

# --- identify value column robustly ---
# Typical value column looks like:
# "value__category_total__sex_total__age_total__unit_of_measurement_rate_per_100_000_population"
candidates <- setdiff(names(df), c("Entity", "Code", "Year"))

# drop helper/annotation columns
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

# Prefer columns that start with "value" (OWID convention), else numeric fallback
value_like <- candidates[grepl("^value(\\b|__)", candidates)]
if (length(value_like) >= 1) {
  value_col <- value_like[1]
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
  "Data sources: United Nations Office on Drugs and Crime (2025);",
  "UN, World Population Prospects (2024); Various sources (Population, 2024) ???",
  "with major processing by Our World in Data.",
  "Please credit all sources listed above. Data provided by third-party sources",
  "through Our World in Data remains subject to the original providers' license terms."
)

meta_compact <- list(
  title       = metadata$title %||% "Homicide rate per 100,000 population",
  variable    = value_col,
  unit        = metadata$unit %||% "homicides per 100,000 population",
  description = metadata$description %||% NULL,
  owidTags    = metadata$owidTags %||% NULL,
  dataPublishedBy    = metadata$dataPublishedBy %||% NULL,
  dataPublisherSource = metadata$dataPublisherSource %||% NULL,
  lastUpdated = metadata$lastUpdated %||% NULL,
  dateRange   = metadata$dataEditedAt %||% NULL,  # optional; OWID sometimes fills different fields
  retrieved   = as.character(Sys.Date()),
  source_and_citation = citation_text
)

out <- list(
  dataset = "homicide-rate-unodc",
  country = "Norway",
  metadata = meta_compact,
  data = norway_df
)

# --- write JSON (UTF-8) ---
jsonlite::write_json(out, "norway_homicide_rate.json", pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_homicide_rate_records.json", pretty = TRUE, auto_unbox = TRUE)

cat("Wrote:\n - norway_homicide_rate.json\n - norway_homicide_rate_records.json\n")
