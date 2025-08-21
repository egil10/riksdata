# --- packages ---
library(jsonlite)

# --- OWID API URLs (Life expectancy) ---
data_url <- "https://ourworldindata.org/grapher/life-expectancy.csv?v=1&csvType=full&useColumnShortNames=true"
meta_url <- "https://ourworldindata.org/grapher/life-expectancy.metadata.json?v=1&csvType=full&useColumnShortNames=true"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)  # preserve original header
metadata <- jsonlite::fromJSON(meta_url)

# --- identify value column robustly ---
# Preferred short name: life_expectancy_0  (period life expectancy at birth)
candidates <- setdiff(names(df), c("Entity", "Code", "Year"))
# drop helper/annotation columns
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

if ("life_expectancy_0" %in% names(df)) {
  value_col <- "life_expectancy_0"
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
  "Data sources: Human Mortality Database (2024); UN, World Population Prospects (2024);",
  "Zijdeman et al. (2014); James C. Riley (2005) ??? with major processing by Our World in Data.",
  "Please credit all sources listed above. Data provided by third-party sources through",
  "Our World in Data remains subject to the original providers' license terms."
)

meta_compact <- list(
  title       = metadata$title %||% "Life expectancy ??? Riley; Zijdeman et al.; HMD; UN WPP (long-run)",
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

out <- list(
  dataset = "life-expectancy",
  country = "Norway",
  metadata = meta_compact,
  data = norway_df
)

# --- write JSON (UTF-8) ---
jsonlite::write_json(out, "norway_life_expectancy.json", pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_life_expectancy_records.json", pretty = TRUE, auto_unbox = TRUE)

cat("Wrote:\n - norway_life_expectancy.json\n - norway_life_expectancy_records.json\n")
