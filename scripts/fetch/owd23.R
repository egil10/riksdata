# --- packages ---
library(jsonlite)

# --- OWID API URLs (Norway only) ---
data_url <- "https://ourworldindata.org/grapher/weekly-covid-cases.csv?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"
meta_url <- "https://ourworldindata.org/grapher/weekly-covid-cases.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)
metadata <- jsonlite::fromJSON(meta_url)

# --- detect value column robustly ---
candidates <- setdiff(names(df), c("Entity", "Code", "Year", "Day", "Date"))
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

prefs <- c("^weekly_cases$", "weekly", "cases", "value|vals|count|number")
match_idx <- which(Reduce(`|`, lapply(prefs, function(p) grepl(p, candidates, ignore.case = TRUE))))
value_col <- if (length(match_idx)) {
  candidates[match_idx[1]]
} else {
  num_flags <- vapply(df[candidates], is.numeric, logical(1))
  num_candidates <- candidates[num_flags]
  if (!length(num_candidates)) stop("No numeric value column found.")
  num_candidates[1]
}

# --- pick a date-like column if present (OWID often uses 'Year' for dates) ---
date_col <- if ("Date" %in% names(df)) "Date" else if ("Day" %in% names(df)) "Day" else "Year"

# --- tidy for Norway, rename, sort ---
nor_df <- subset(df, Entity == "Norway", select = c("Entity", "Code", date_col, value_col))
names(nor_df)[names(nor_df) == value_col] <- "value"
names(nor_df)[names(nor_df) == date_col]  <- "date"

# Try to parse date if it's character; leave numeric years as-is
if (is.character(nor_df$date)) {
  suppressWarnings({
    dt <- as.Date(nor_df$date)
    if (all(!is.na(dt))) nor_df$date <- dt
  })
}

nor_df <- nor_df[order(nor_df$date), ]

# --- helpers ---
`%||%` <- function(a, b) if (!is.null(a)) a else b

citation_text <- paste(
  "Source: World Health Organization (2025) ??? processed by Our World in Data.",
  "Indicator: Weekly confirmed COVID-19 cases (cumulative over the previous 7 days).",
  "Unit: cases."
)

meta_compact <- list(
  title       = metadata$title %||% "Weekly confirmed COVID-19 cases",
  variable    = value_col,
  unit        = metadata$unit %||% "cases",
  description = metadata$description %||% NULL,
  owidTags    = metadata$owidTags %||% NULL,
  dataPublishedBy    = metadata$dataPublishedBy %||% NULL,
  dataPublisherSource = metadata$dataPublisherSource %||% NULL,
  lastUpdated = metadata$lastUpdated %||% NULL,
  retrieved   = as.character(Sys.Date()),
  source_and_citation = citation_text
)

# --- assemble output bundle ---
out <- list(
  dataset = "weekly-covid-cases (WHO, OWID processed)",
  country = "Norway",
  metadata = meta_compact,
  data = nor_df
)

# --- write JSON artifacts (UTF-8) ---
jsonlite::write_json(out,      "norway_weekly_covid_cases.json",         pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_weekly_covid_cases_records.json", pretty = TRUE, auto_unbox = TRUE)

# --- write NDJSON (one record per line) ---
con <- file("norway_weekly_covid_cases.ndjson", open = "w", encoding = "UTF-8")
apply(nor_df, 1, function(row) writeLines(jsonlite::toJSON(as.list(row), auto_unbox = TRUE), con = con))
close(con)

cat("Wrote:\n",
    " - norway_weekly_covid_cases.json\n",
    " - norway_weekly_covid_cases_records.json\n",
    " - norway_weekly_covid_cases.ndjson\n")
