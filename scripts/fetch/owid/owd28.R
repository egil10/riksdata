# --- packages ---
library(jsonlite)

# --- OWID API URLs (Norway, filtered) ---
data_url <- "https://ourworldindata.org/grapher/average-years-of-schooling.csv?v=1&csvType=filtered&useColumnShortNames=true&tab=line&time=earliest..2023&country=~NOR&mapSelect=~NOR"
meta_url <- "https://ourworldindata.org/grapher/average-years-of-schooling.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&tab=line&time=earliest..2023&country=~NOR&mapSelect=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)
metadata <- jsonlite::fromJSON(meta_url)

# --- detect the value column (avg years of schooling) ---
# Prefer short code "mys" or any column mentioning "school"
cands <- setdiff(names(df), c("Entity","Code","Year","Date","Day"))
pref  <- cands[grepl("(^mys|school)", cands, ignore.case = TRUE)]
val_col <- if (length(pref)) pref[1] else cands[1]
if (is.na(val_col)) stop("Could not find the value column for average years of schooling.")

# --- choose date-like column (OWID usually uses 'Year') ---
date_col <- if ("Year" %in% names(df)) "Year" else if ("Date" %in% names(df)) "Date" else "Day"

# --- Norway only, keep relevant columns ---
keep <- unique(c("Entity","Code", date_col, val_col))
nor <- subset(df, Entity == "Norway", select = keep)

# --- standardize names ---
names(nor)[names(nor) == date_col] <- "year"
names(nor)[names(nor) == val_col]  <- "avg_years_schooling"

# coerce types & sort
nor$year <- as.integer(nor$year)
nor$avg_years_schooling <- as.numeric(nor$avg_years_schooling)
nor <- nor[order(nor$year), ]

# --- simple quality flags (NA & monotonic note if desired) ---
nor$is_missing <- is.na(nor$avg_years_schooling)

# --- compact metadata for the bundle ---
`%||%` <- function(a, b) if (!is.null(a) && length(a)) a else b
citation_text <- paste0(
  "Source: UNDP, Human Development Report (2025) ??? with minor processing by Our World in Data. ",
  "Indicator: average years of schooling among adults aged 25+ (formal education only; repeats excluded)."
)

meta_compact <- list(
  title       = metadata$title %||% "Average years of schooling (ages 25+)",
  variable    = "avg_years_schooling",
  unit        = metadata$unit %||% "years",
  description = metadata$description %||% NULL,
  owidTags    = metadata$owidTags %||% NULL,
  dataPublishedBy    = metadata$dataPublishedBy %||% NULL,
  dataPublisherSource = metadata$dataPublisherSource %||% NULL,
  lastUpdated = metadata$lastUpdated %||% NULL,
  retrieved   = as.character(Sys.Date()),
  source_and_citation = citation_text,
  notes = "Formal education is ISCED 1+; excludes years repeating grades; population ages 25+."
)

records <- nor[, c("Entity","Code","year","avg_years_schooling","is_missing")]

bundle <- list(
  dataset = "average-years-of-schooling (UNDP; OWID processed)",
  country = "Norway",
  metadata = meta_compact,
  data = records
)

# --- write JSON artifacts (UTF-8) ---
jsonlite::write_json(bundle,  "norway_avg_years_schooling.json",         pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(records, "norway_avg_years_schooling_records.json", pretty = TRUE, auto_unbox = TRUE)

# --- NDJSON (one line per year) ---
con <- file("norway_avg_years_schooling.ndjson", open = "w", encoding = "UTF-8")
apply(records, 1, function(row) writeLines(jsonlite::toJSON(as.list(row), auto_unbox = TRUE), con = con))
close(con)

cat("Wrote:\n",
    " - norway_avg_years_schooling.json\n",
    " - norway_avg_years_schooling_records.json\n",
    " - norway_avg_years_schooling.ndjson\n")
