# --- packages ---
library(jsonlite)

# --- OWID API URLs (HDI ??? filtered to Norway) ---
data_url <- "https://ourworldindata.org/grapher/human-development-index.csv?v=1&csvType=filtered&useColumnShortNames=true&tab=discrete-bar&country=~NOR"
meta_url <-  "https://ourworldindata.org/grapher/human-development-index.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&tab=discrete-bar&country=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)
metadata <- jsonlite::fromJSON(meta_url)

# --- pick the value column robustly ---
candidates <- setdiff(names(df), c("Entity", "Code", "Year"))
# drop helper columns like annotations/notes/CI
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

# prefer columns that look like HDI series
pref <- c("hdi", "human_development_index", "sex_total", "estimate")
match_idx <- which(Reduce(`|`, lapply(pref, function(p) grepl(p, candidates, ignore.case = TRUE))))
value_col <- if (length(match_idx)) {
  candidates[match_idx[1]]
} else {
  # fallback: first numeric candidate
  num_flags <- vapply(df[candidates], is.numeric, logical(1))
  num_candidates <- candidates[num_flags]
  if (length(num_candidates) == 0) stop("No numeric value column found.")
  num_candidates[1]
}

# --- subset, rename, sort ---
norway_df <- subset(df, Entity == "Norway", select = c("Entity", "Code", "Year", value_col))
names(norway_df)[names(norway_df) == value_col] <- "value"
norway_df <- norway_df[order(norway_df$Year), ]

# --- compact metadata & citation ---
`%||%` <- function(a, b) if (!is.null(a)) a else b
citation_text <- paste(
  "Source: UNDP, Human Development Report (2025) ??? with minor processing by Our World in Data.",
  "HDI is a 0???1 index combining life expectancy, education, and GNI per capita (PPP, 2021 prices),",
  "aggregated via a geometric mean. Higher values indicate higher human development."
)

meta_compact <- list(
  title       = metadata$title %||% "Human Development Index (HDI)",
  variable    = value_col,
  unit        = metadata$unit %||% "index (0???1)",
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
  dataset = "human-development-index (UNDP HDR, OWID processed)",
  country = "Norway",
  metadata = meta_compact,
  data = norway_df
)

# --- write JSON (UTF-8) ---
jsonlite::write_json(out,      "norway_hdi.json",           pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_hdi_records.json",   pretty = TRUE, auto_unbox = TRUE)

cat("Wrote:\n - norway_hdi.json\n - norway_hdi_records.json\n")
