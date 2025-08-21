# --- packages ---
library(jsonlite)

# --- OWID API URLs (Median age, filtered to Norway) ---
data_url <- "https://ourworldindata.org/grapher/median-age.csv?v=1&csvType=filtered&useColumnShortNames=true&country=~NOR"
meta_url <- "https://ourworldindata.org/grapher/median-age.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&country=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)   # preserve original header
metadata <- jsonlite::fromJSON(meta_url)

# --- identify value column ---
candidates <- setdiff(names(df), c("Entity", "Code", "Year"))
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

# Expected: "median_age__sex_all__age_all__variant_estimates"
if (any(grepl("median_age", candidates))) {
  value_col <- candidates[grepl("median_age", candidates)][1]
} else {
  # fallback: first numeric column
  num_flags <- vapply(df[candidates], is.numeric, logical(1))
  num_candidates <- candidates[num_flags]
  if (length(num_candidates) == 0) stop("No numeric value column found among: ", paste(candidates, collapse = ", "))
  value_col <- num_candidates[1]
}

# --- Norway only (filtered endpoint already ensures this), tidy, sort ---
norway_df <- subset(df, Entity == "Norway", select = c("Entity", "Code", "Year", value_col))
names(norway_df)[names(norway_df) == value_col] <- "value"
norway_df <- norway_df[order(norway_df$Year), ]

# --- compact metadata & citation ---
`%||%` <- function(a, b) if (!is.null(a)) a else b

citation_text <- paste(
  "Data source: United Nations, World Population Prospects (2024) ??? processed by Our World in Data.",
  "Please credit all sources listed above. Data provided by third-party sources through",
  "Our World in Data remains subject to the original providers' license terms."
)

meta_compact <- list(
  title       = metadata$title %||% "Median age",
  variable    = value_col,
  unit        = metadata$unit %||% "years",
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
  dataset = "median-age",
  country = "Norway",
  metadata = meta_compact,
  data = norway_df
)

# --- write JSON (UTF-8) ---
jsonlite::write_json(out, "norway_median_age.json", pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_median_age_records.json", pretty = TRUE, auto_unbox = TRUE)

cat("Wrote:\n - norway_median_age.json\n - norway_median_age_records.json\n")
