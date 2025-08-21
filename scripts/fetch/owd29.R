# --- packages ---
library(jsonlite)

# --- OWID API URLs (Norway, filtered) ---
data_url <- "https://ourworldindata.org/grapher/average-performance-of-15-year-olds-on-the-science-scale.csv?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"
meta_url <- "https://ourworldindata.org/grapher/average-performance-of-15-year-olds-on-the-science-scale.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)
metadata <- jsonlite::fromJSON(meta_url)

# --- detect the value column (PISA science score) ---
# Prefer short codes that mention "pisa" & "science" or "average"
cands <- setdiff(names(df), c("Entity","Code","Year","Date","Day"))
pref  <- cands[grepl("pisa.*science|science.*average|pisa_science|science_all_average", cands, ignore.case = TRUE)]
val_col <- if (length(pref)) pref[1] else cands[1]
stopifnot(!is.na(val_col), nchar(val_col) > 0)

# --- choose date-like column (OWID usually uses 'Year') ---
date_col <- if ("Year" %in% names(df)) "Year" else if ("Date" %in% names(df)) "Date" else "Day"

# --- Norway only, keep relevant columns ---
keep <- unique(c("Entity","Code", date_col, val_col))
nor <- subset(df, Entity == "Norway", select = keep)

# --- standardize names ---
names(nor)[names(nor) == date_col] <- "year"
names(nor)[names(nor) == val_col]  <- "pisa_science_score"

# coerce types & sort
nor$year <- as.integer(nor$year)
nor$pisa_science_score <- as.numeric(nor$pisa_science_score)
nor <- nor[order(nor$year), ]

# basic quality flag
nor$is_missing <- is.na(nor$pisa_science_score)

# --- compact metadata for the bundle ---
`%||%` <- function(a, b) if (!is.null(a) && length(a)) a else b

citation_text <- paste0(
  "Source: OECD (2023) ??? with minor processing by Our World in Data. ",
  "Indicator: average PISA science score for 15-year-olds (OECD scale; mean=500, SD=100 in base year)."
)

meta_compact <- list(
  title       = metadata$title %||% "Average performance of 15-year-olds in sciences (PISA)",
  variable    = "pisa_science_score",
  unit        = metadata$unit %||% "PISA score",
  description = metadata$description %||% NULL,
  owidTags    = metadata$owidTags %||% NULL,
  dataPublishedBy    = metadata$dataPublishedBy %||% NULL,
  dataPublisherSource = metadata$dataPublisherSource %||% NULL,
  lastUpdated = metadata$lastUpdated %||% NULL,
  retrieved   = as.character(Sys.Date()),
  source_and_citation = citation_text,
  notes = "Scores calibrated to maintain comparability across cycles; see OECD/OWID notes for details."
)

records <- nor[, c("Entity","Code","year","pisa_science_score","is_missing")]

bundle <- list(
  dataset = "average-performance-of-15-year-olds-on-the-science-scale (OECD; OWID processed)",
  country = "Norway",
  metadata = meta_compact,
  data = records
)

# --- write JSON artifacts (UTF-8) ---
jsonlite::write_json(bundle,  "norway_pisa_science.json",         pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(records, "norway_pisa_science_records.json", pretty = TRUE, auto_unbox = TRUE)

# --- NDJSON (one line per year) ---
con <- file("norway_pisa_science.ndjson", open = "w", encoding = "UTF-8")
apply(records, 1, function(row) writeLines(jsonlite::toJSON(as.list(row), auto_unbox = TRUE), con = con))
close(con)

cat("Wrote:\n",
    " - norway_pisa_science.json\n",
    " - norway_pisa_science_records.json\n",
    " - norway_pisa_science.ndjson\n")
