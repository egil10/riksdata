# --- packages ---
library(jsonlite)

# --- OWID API URLs (Military spending, SIPRI) ---
data_url <- "https://ourworldindata.org/grapher/military-spending-as-a-share-of-gdp-sipri.csv?v=1&csvType=full&useColumnShortNames=true"
meta_url <- "https://ourworldindata.org/grapher/military-spending-as-a-share-of-gdp-sipri.metadata.json?v=1&csvType=full&useColumnShortNames=true"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)
metadata <- jsonlite::fromJSON(meta_url)

# --- identify value column robustly ---
# For this indicator, OWID short name is usually "share_gdp"
candidates <- setdiff(names(df), c("Entity", "Code", "Year"))
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$", candidates, ignore.case = TRUE)]

if ("share_gdp" %in% names(df)) {
  value_col <- "share_gdp"
} else {
  num_flags <- vapply(df[candidates], is.numeric, logical(1))
  num_candidates <- candidates[num_flags]
  if (length(num_candidates) == 0) stop("No numeric value column found among: ", paste(candidates, collapse = ", "))
  value_col <- num_candidates[1]
}

# --- Norway only, tidy ---
norway_df <- subset(df, Entity == "Norway", select = c("Entity", "Code", "Year", value_col))
names(norway_df)[names(norway_df) == value_col] <- "value"
norway_df <- norway_df[order(norway_df$Year), ]

# --- compact metadata & citation ---
`%||%` <- function(a, b) if (!is.null(a)) a else b

citation_text <- "Data source: Stockholm International Peace Research Institute (2025) ??? with minor processing by Our World in Data. Please credit all sources listed above. Data provided by third-party sources through Our World in Data remains subject to the original providers' license terms."

meta_compact <- list(
  title       = metadata$title %||% "Military spending as a share of GDP",
  variable    = value_col,
  unit        = metadata$unit %||% "% of GDP",
  description = metadata$description %||% NULL,
  owidTags    = metadata$owidTags %||% NULL,
  dataPublishedBy    = metadata$dataPublishedBy %||% NULL,
  dataPublisherSource = metadata$dataPublisherSource %||% NULL,
  lastUpdated = metadata$lastUpdated %||% NULL,
  retrieved   = as.character(Sys.Date()),
  source_and_citation = citation_text
)

out <- list(
  dataset = "military-spending-as-a-share-of-gdp-sipri",
  country = "Norway",
  metadata = meta_compact,
  data = norway_df
)

# --- write JSON ---
jsonlite::write_json(out, "norway_military_spending.json", pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_military_spending_records.json", pretty = TRUE, auto_unbox = TRUE)

cat("Wrote:\n - norway_military_spending.json\n - norway_military_spending_records.json\n")
