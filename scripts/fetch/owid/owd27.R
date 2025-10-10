# --- packages ---
library(jsonlite)

# --- OWID API URLs (Norway only) ---
data_url <- "https://ourworldindata.org/grapher/share-of-population-15-years-and-older-with-no-education.csv?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"
meta_url <- "https://ourworldindata.org/grapher/share-of-population-15-years-and-older-with-no-education.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)
metadata <- jsonlite::fromJSON(meta_url)

# --- detect the value column (share %) ---
val_col <- names(df)[grepl("no education", names(df), ignore.case = TRUE)][1]
if (is.na(val_col)) stop("Could not find the value column containing 'no education'.")

# --- choose date-like column (OWID uses 'Year') ---
date_col <- if ("Date" %in% names(df)) "Date" else if ("Day" %in% names(df)) "Day" else "Year"

# --- Norway only, keep relevant columns ---
keep <- unique(c("Entity","Code", date_col, val_col))
nor <- subset(df, Entity == "Norway", select = keep)

# --- standardize names ---
names(nor)[names(nor) == date_col] <- "year"
names(nor)[names(nor) == val_col]  <- "no_education_share"

# coerce types & sort
nor$year <- as.integer(nor$year)
nor$no_education_share <- as.numeric(nor$no_education_share)
nor <- nor[order(nor$year), ]

# --- add flags per OWID note: <=2014 = estimates; >=2015 = projections ---
nor$period <- ifelse(nor$year >= 2015, "projection", "estimate")
nor$is_projection <- nor$period == "projection"

# --- compact metadata for the bundle ---
`%||%` <- function(a, b) if (!is.null(a)) a else b
citation_text <- paste0(
  "Sources: Barro and Lee (2015); Lee and Lee (2016) ??? with major processing by Our World in Data. ",
  "Indicator: share of adults (15???64) with no formal education. ",
  "Note: data before 2015 are estimates; data from 2015 onwards are projections (per OWID)."
)

meta_compact <- list(
  title       = metadata$title %||% "Share of population with no formal education (ages 15???64)",
  variable    = "no_education_share",
  unit        = metadata$unit %||% "%",
  description = metadata$description %||% NULL,
  owidTags    = metadata$owidTags %||% NULL,
  dataPublishedBy    = metadata$dataPublishedBy %||% NULL,
  dataPublisherSource = metadata$dataPublisherSource %||% NULL,
  lastUpdated = metadata$lastUpdated %||% NULL,
  retrieved   = as.character(Sys.Date()),
  source_and_citation = citation_text
)

records <- nor[, c("Entity","Code","year","no_education_share","period","is_projection")]

bundle <- list(
  dataset = "share-of-population-15-years-and-older-with-no-education (Barro & Lee; Lee & Lee; OWID processed)",
  country = "Norway",
  metadata = meta_compact,
  data = records
)

# --- write JSON artifacts (UTF-8) ---
jsonlite::write_json(bundle,  "norway_no_education_share.json",         pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(records, "norway_no_education_share_records.json", pretty = TRUE, auto_unbox = TRUE)

# --- NDJSON (one line per year) ---
con <- file("norway_no_education_share.ndjson", open = "w", encoding = "UTF-8")
apply(records, 1, function(row) writeLines(jsonlite::toJSON(as.list(row), auto_unbox = TRUE), con = con))
close(con)

cat("Wrote:\n",
    " - norway_no_education_share.json\n",
    " - norway_no_education_share_records.json\n",
    " - norway_no_education_share.ndjson\n")
