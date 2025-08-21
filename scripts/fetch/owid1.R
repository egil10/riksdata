# --- packages ---
library(jsonlite)

# --- URLs (from OWID) ---
data_url <- "https://ourworldindata.org/grapher/foreign-aid-given-per-capita.csv?v=1&csvType=full&useColumnShortNames=true"
meta_url <- "https://ourworldindata.org/grapher/foreign-aid-given-per-capita.metadata.json?v=1&csvType=full&useColumnShortNames=true"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)  # keep original names
metadata <- jsonlite::fromJSON(meta_url)

# --- identify value column robustly ---
known_var <- "i_oda_net_disbursements_per_capita"

candidates <- setdiff(names(df), c("Entity", "Code", "Year"))
# drop helper columns that aren't data series
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$", candidates, ignore.case = TRUE)]

if (known_var %in% names(df)) {
  value_col <- known_var
} else {
  # fall back: pick first numeric candidate
  num_flags <- vapply(df[candidates], is.numeric, logical(1))
  num_candidates <- candidates[num_flags]
  if (length(num_candidates) == 0) stop("No numeric value column found among: ", paste(candidates, collapse = ", "))
  value_col <- num_candidates[1]
}

# --- filter to Norway & tidy ---
norway_df <- subset(df, Entity == "Norway", select = c("Entity", "Code", "Year", value_col))
names(norway_df)[names(norway_df) == value_col] <- "value"
norway_df <- norway_df[order(norway_df$Year), ]

# --- compact metadata & citation ---
`%||%` <- function(a, b) if (!is.null(a)) a else b
citation_text <- "Data sources: OECD (2025) ??? with major processing by Our World in Data. Please credit all sources listed above. Data provided by third-party sources through Our World in Data remains subject to the original provider's license terms."

meta_compact <- list(
  title       = metadata$title %||% "ODA per capita by donor ??? Net disbursements",
  variable    = value_col,
  unit        = metadata$unit %||% NULL,
  description = metadata$description %||% NULL,
  owidTags    = metadata$owidTags %||% NULL,
  dataPublishedBy    = metadata$dataPublishedBy %||% NULL,
  dataPublisherSource = metadata$dataPublisherSource %||% NULL,
  retrieved   = as.character(Sys.Date()),
  source_and_citation = citation_text
)

out <- list(
  dataset = "foreign-aid-given-per-capita",
  country = "Norway",
  metadata = meta_compact,
  data = norway_df
)

# --- write JSON (UTF-8) ---
jsonlite::write_json(out, "norway_oda_per_capita.json", pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_oda_per_capita_records.json", pretty = TRUE, auto_unbox = TRUE)

cat("Wrote:\n - norway_oda_per_capita.json\n - norway_oda_per_capita_records.json\n")
