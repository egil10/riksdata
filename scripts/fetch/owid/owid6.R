# --- packages ---
library(jsonlite)

# --- OWID API URLs (V-Dem: Share of women in parliament) ---
data_url <- "https://ourworldindata.org/grapher/share-of-women-in-parliament.csv?v=1&csvType=full&useColumnShortNames=true"
meta_url <- "https://ourworldindata.org/grapher/share-of-women-in-parliament.metadata.json?v=1&csvType=full&useColumnShortNames=true"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)  # keep original header
metadata <- jsonlite::fromJSON(meta_url)

# --- identify value column robustly ---
# Preferred central estimate from V-Dem:
preferred <- c("wom_parl_vdem__estimate_best", "estimate_best", "share", "value")
candidates <- setdiff(names(df), c("Entity", "Code", "Year"))

# drop helper/annotation columns (and variants)
candidates <- candidates[!grepl("(annotations|notes?|ci|se|low|high)$|(-annotations$)", candidates, ignore.case = TRUE)]

if (any(preferred %in% names(df))) {
  value_col <- (preferred[preferred %in% names(df)])[1]
} else {
  # fallback: pick first numeric candidate
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
citation_text <- "Data source: V-Dem (2025) ??? processed by Our World in Data. Please credit all sources listed above. Data provided by third-party sources through Our World in Data remains subject to the original providers' license terms."

meta_compact <- list(
  title       = metadata$title %||% "Share of women in parliament ??? V-Dem",
  variable    = value_col,
  unit        = metadata$unit %||% "%",
  description = metadata$description %||% NULL,
  owidTags    = metadata$owidTags %||% NULL,
  dataPublishedBy    = metadata$dataPublishedBy %||% NULL,
  dataPublisherSource = metadata$dataPublisherSource %||% NULL,
  lastUpdated = metadata$lastUpdated %||% NULL,
  retrieved   = as.character(Sys.Date()),
  source_and_citation = citation_text
)

out <- list(
  dataset = "share-of-women-in-parliament",
  country = "Norway",
  metadata = meta_compact,
  data = norway_df
)

# --- write JSON (UTF-8) ---
jsonlite::write_json(out, "norway_women_in_parliament.json", pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_women_in_parliament_records.json", pretty = TRUE, auto_unbox = TRUE)

cat("Wrote:\n - norway_women_in_parliament.json\n - norway_women_in_parliament_records.json\n")
