# --- packages ---
library(jsonlite)

# --- OWID API URLs ---
data_url <- "https://ourworldindata.org/grapher/share-of-individuals-using-the-internet.csv?v=1&csvType=full&useColumnShortNames=true"
meta_url <- "https://ourworldindata.org/grapher/share-of-individuals-using-the-internet.metadata.json?v=1&csvType=full&useColumnShortNames=true"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)  # keep original header
metadata <- jsonlite::fromJSON(meta_url)

# --- identify value column robustly ---
# Known short name from WB: it_net_user_zs (Individuals using the Internet, % of population)
known_var <- "it_net_user_zs"

candidates <- setdiff(names(df), c("Entity", "Code", "Year"))
# drop common helper/annotation columns
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$", candidates, ignore.case = TRUE)]

if (known_var %in% names(df)) {
  value_col <- known_var
} else {
  # fall back to first numeric candidate
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

citation_text <- "Data sources: International Telecommunication Union (ITU), via World Bank (2025) ??? with minor processing by Our World in Data. Please credit all sources listed above. Data provided by third-party sources through Our World in Data remains subject to the original provider's license terms."

meta_compact <- list(
  title       = metadata$title %||% "Share of the population using the Internet",
  variable    = value_col,
  unit        = metadata$unit %||% "% of population",
  description = metadata$description %||% NULL,
  owidTags    = metadata$owidTags %||% NULL,
  dataPublishedBy    = metadata$dataPublishedBy %||% NULL,
  dataPublisherSource = metadata$dataPublisherSource %||% NULL,
  lastUpdated = metadata$lastUpdated %||% NULL,  # often present for OWID
  retrieved   = as.character(Sys.Date()),
  source_and_citation = citation_text
)

out <- list(
  dataset = "share-of-individuals-using-the-internet",
  country = "Norway",
  metadata = meta_compact,
  data = norway_df
)

# --- write JSON (UTF-8) ---
jsonlite::write_json(out, "norway_internet_use.json", pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_internet_use_records.json", pretty = TRUE, auto_unbox = TRUE)

cat("Wrote:\n - norway_internet_use.json\n - norway_internet_use_records.json\n")
