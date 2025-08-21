# --- packages ---
library(jsonlite)

# --- OWID API URLs (Fertility rate: births per woman ??? filtered to Norway) ---
data_url <- "https://ourworldindata.org/grapher/children-born-per-woman.csv?v=1&csvType=filtered&useColumnShortNames=true&country=~NOR"
meta_url <- "https://ourworldindata.org/grapher/children-born-per-woman.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&country=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)   # preserve original column names
metadata <- jsonlite::fromJSON(meta_url)

# --- identify value column robustly ---
# Common OWID short names seen here include "fertility_rate_hist" or similar.
candidates <- setdiff(names(df), c("Entity", "Code", "Year"))
# drop helper/annotation columns
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

preferred_patterns <- c("fertility", "children", "born", "births")
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

# --- Norway only (endpoint is filtered already), tidy, sort ---
norway_df <- subset(df, Entity == "Norway", select = c("Entity", "Code", "Year", value_col))
names(norway_df)[names(norway_df) == value_col] <- "value"
norway_df <- norway_df[order(norway_df$Year), ]

# --- compact metadata & citation ---
`%||%` <- function(a, b) if (!is.null(a)) a else b
citation_text <- paste(
  "Data sources: UN WPP (2024); Human Fertility Database (2024) ??? with major processing by Our World in Data.",
  "Please credit all sources listed above. Data provided by third-party sources through",
  "Our World in Data remains subject to the original providers' license terms."
)

meta_compact <- list(
  title       = metadata$title %||% "Fertility rate: births per woman (period)",
  variable    = value_col,
  unit        = metadata$unit %||% "live births per woman",
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
  dataset = "children-born-per-woman (fertility, period)",
  country = "Norway",
  metadata = meta_compact,
  data = norway_df
)

# --- write JSON (UTF-8) ---
jsonlite::write_json(out, "norway_fertility_rate_period.json", pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_fertility_rate_period_records.json", pretty = TRUE, auto_unbox = TRUE)

cat("Wrote:\n - norway_fertility_rate_period.json\n - norway_fertility_rate_period_records.json\n")
