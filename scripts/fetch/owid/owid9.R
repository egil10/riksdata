# --- packages ---
library(jsonlite)

# --- OWID API URLs (Child mortality rate) ---
data_url <- "https://ourworldindata.org/grapher/child-mortality.csv?v=1&csvType=full&useColumnShortNames=true"
meta_url <- "https://ourworldindata.org/grapher/child-mortality.metadata.json?v=1&csvType=full&useColumnShortNames=true"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)   # preserve original header
metadata <- jsonlite::fromJSON(meta_url)

# --- identify value column robustly ---
# OWID short name shown on the page: child_mortality_rate
candidates <- setdiff(names(df), c("Entity", "Code", "Year"))
# drop helper/annotation columns
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

if ("child_mortality_rate" %in% names(df)) {
  value_col <- "child_mortality_rate"
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
  "Data sources: United Nations Inter-agency Group for Child Mortality Estimation (2025);",
  "Gapminder (2015); Gapminder based on UN IGME & UN WPP (2020);",
  "Population based on various sources (2024) ??? processed by Our World in Data.",
  "Please credit all sources listed above. Data provided by third-party sources through",
  "Our World in Data remains subject to the original providers' license terms."
)

meta_compact <- list(
  title       = metadata$title %||% "Child mortality rate ??? Long-run (Gapminder; UN IGME)",
  variable    = value_col,
  unit        = metadata$unit %||% "deaths per 100 live births",
  description = metadata$description %||% NULL,
  owidTags    = metadata$owidTags %||% NULL,
  dataPublishedBy    = metadata$dataPublishedBy %||% NULL,
  dataPublisherSource = metadata$dataPublisherSource %||% NULL,
  lastUpdated = metadata$lastUpdated %||% NULL,
  retrieved   = as.character(Sys.Date()),
  source_and_citation = citation_text
)

out <- list(
  dataset = "child-mortality",
  country = "Norway",
  metadata = meta_compact,
  data = norway_df
)

# --- write JSON (UTF-8) ---
jsonlite::write_json(out, "norway_child_mortality.json", pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_child_mortality_records.json", pretty = TRUE, auto_unbox = TRUE)

cat("Wrote:\n - norway_child_mortality.json\n - norway_child_mortality_records.json\n")
