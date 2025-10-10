# --- packages ---
library(jsonlite)

# --- OWID API URLs (Norway only) ---
data_url <- "https://ourworldindata.org/grapher/per-capita-energy-use.csv?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"
meta_url <- "https://ourworldindata.org/grapher/per-capita-energy-use.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)
metadata <- jsonlite::fromJSON(meta_url)

# --- robustly choose the value column ---
candidates <- setdiff(names(df), c("Entity", "Code", "Year"))
# drop helper/annotation-ish columns if present
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

# prefer expected short name then sensible fallbacks
prefs <- c("^primary_energy_consumption_per_capita__kwh$", "kwh", "energy|consumption|per_capita", "value|vals")
match_idx <- which(Reduce(`|`, lapply(prefs, function(p) grepl(p, candidates, ignore.case = TRUE))))
value_col <- if (length(match_idx)) {
  candidates[match_idx[1]]
} else {
  num_flags <- vapply(df[candidates], is.numeric, logical(1))
  num_candidates <- candidates[num_flags]
  if (!length(num_candidates)) stop("No numeric value column found in dataset.")
  num_candidates[1]
}

# --- tidy, rename, sort ---
nor_df <- subset(df, Entity == "Norway", select = c("Entity", "Code", "Year", value_col))
names(nor_df)[names(nor_df) == value_col] <- "value"
nor_df <- nor_df[order(nor_df$Year), ]

# --- compact metadata & citation ---
`%||%` <- function(a, b) if (!is.null(a)) a else b

citation_text <- paste(
  "Source: U.S. Energy Information Administration (2025); Energy Institute - Statistical Review of World Energy (2025);",
  "Population based on various sources (2024) ??? with major processing by Our World in Data.",
  "Indicator: Primary energy consumption per capita (kWh/person) using the substitution method."
)

meta_compact <- list(
  title       = metadata$title %||% "Primary energy consumption per capita (kWh/person)",
  variable    = value_col,
  unit        = metadata$unit %||% "kilowatt-hours per person",
  description = metadata$description %||% NULL,
  owidTags    = metadata$owidTags %||% NULL,
  dataPublishedBy    = metadata$dataPublishedBy %||% NULL,
  dataPublisherSource = metadata$dataPublisherSource %||% NULL,
  lastUpdated = metadata$lastUpdated %||% NULL,
  retrieved   = as.character(Sys.Date()),
  source_and_citation = citation_text
)

# --- assemble output object ---
out <- list(
  dataset = "per-capita-energy-use (EIA + Energy Institute, OWID processed)",
  country = "Norway",
  metadata = meta_compact,
  data = nor_df
)

# --- write JSON artifacts (UTF-8) ---
jsonlite::write_json(out,      "norway_energy_use_per_capita.json",         pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_energy_use_per_capita_records.json", pretty = TRUE, auto_unbox = TRUE)

# --- write NDJSON (one record per line) ---
con <- file("norway_energy_use_per_capita.ndjson", open = "w", encoding = "UTF-8")
apply(nor_df, 1, function(row) writeLines(jsonlite::toJSON(as.list(row), auto_unbox = TRUE), con = con))
close(con)

cat("Wrote:\n",
    " - norway_energy_use_per_capita.json\n",
    " - norway_energy_use_per_capita_records.json\n",
    " - norway_energy_use_per_capita.ndjson\n")
