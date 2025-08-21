# --- packages ---
library(jsonlite)

# --- OWID API URLs (Mean income or consumption per day ??? filtered to Norway) ---
data_url <- "https://ourworldindata.org/grapher/daily-mean-income.csv?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"
meta_url <- "https://ourworldindata.org/grapher/daily-mean-income.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)  # preserve original column names
metadata <- jsonlite::fromJSON(meta_url)

# --- identify value column robustly ---
# OWID may include helper cols like "...-annotations". Keep only the actual series.
candidates <- setdiff(names(df), c("Entity", "Code", "Year"))
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

# Prefer names that clearly refer to the mean income/consumption series
preferred_patterns <- c("mean", "income", "consumption", "ppp", "2021")
match_idx <- which(Reduce(`|`, lapply(preferred_patterns, function(p) grepl(p, candidates, ignore.case = TRUE))))
if (length(match_idx) >= 1) {
  value_col <- candidates[match_idx[1]]
} else {
  # fallback: first numeric candidate
  num_flags <- vapply(df[candidates], is.numeric, logical(1))
  num_candidates <- candidates[num_flags]
  if (length(num_candidates) == 0) stop("No numeric value column found among: ", paste(candidates, collapse = ", "))
  value_col <- num_candidates[1]
}

# --- subset, rename, sort ---
norway_df <- subset(df, Entity == "Norway", select = c("Entity", "Code", "Year", value_col))
names(norway_df)[names(norway_df) == value_col] <- "value"
norway_df <- norway_df[order(norway_df$Year), ]

# --- compact metadata & citation ---
`%||%` <- function(a, b) if (!is.null(a)) a else b
citation_text <- paste(
  "Data source: World Bank Poverty and Inequality Platform (2025) ??? with major processing by Our World in Data.",
  "Figures are in international-$ at 2021 prices; depending on year/country they reflect income (after taxes/benefits) or consumption, per capita."
)

meta_compact <- list(
  title       = metadata$title %||% "Mean income or consumption per day",
  variable    = value_col,
  unit        = metadata$unit %||% "international-$ (2021 prices) per day",
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
  dataset = "daily-mean-income (World Bank PIP, OWID processed)",
  country = "Norway",
  metadata = meta_compact,
  data = norway_df
)

# --- write JSON (UTF-8) ---
jsonlite::write_json(out, "norway_mean_income_per_day.json", pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_mean_income_per_day_records.json", pretty = TRUE, auto_unbox = TRUE)

cat("Wrote:\n - norway_mean_income_per_day.json\n - norway_mean_income_per_day_records.json\n")
