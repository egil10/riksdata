# --- packages ---
library(jsonlite)

# --- OWID API URLs (Norway only) ---
data_url <- "https://ourworldindata.org/grapher/pisa-test-score-mean-performance-on-the-mathematics-scale.csv?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"
meta_url <- "https://ourworldindata.org/grapher/pisa-test-score-mean-performance-on-the-mathematics-scale.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)
metadata <- jsonlite::fromJSON(meta_url)

# --- pick out the value columns (mean + bounds) ---
# Expected names are "Mathematics", "Upper bound mathematics score", "Lower bound mathematics score"
col_mean  <- names(df)[grepl("^Mathematics$", names(df), ignore.case = FALSE)]
col_upper <- names(df)[grepl("^Upper bound mathematics score$", names(df), ignore.case = TRUE)]
col_lower <- names(df)[grepl("^Lower bound mathematics score$", names(df), ignore.case = TRUE)]

# Fallbacks in case OWID changes wording a bit
if (!length(col_mean))  col_mean  <- names(df)[grepl("mathematics(?!.*bound)", names(df), ignore.case = TRUE, perl = TRUE)][1]
if (!length(col_upper)) col_upper <- names(df)[grepl("upper.*math", names(df), ignore.case = TRUE)][1]
if (!length(col_lower)) col_lower <- names(df)[grepl("lower.*math", names(df), ignore.case = TRUE)][1]

value_cols <- c(col_mean, col_lower, col_upper)
value_cols <- value_cols[!is.na(value_cols) & nzchar(value_cols)]

# --- choose a date-like column (OWID usually 'Year') ---
date_col <- if ("Date" %in% names(df)) "Date" else if ("Day" %in% names(df)) "Day" else "Year"

# --- Norway only, keep relevant columns ---
keep <- unique(c("Entity","Code", date_col, value_cols))
nor_df_raw <- subset(df, Entity == "Norway", select = keep)

# --- rename to standard keys ---
nor_df <- nor_df_raw
names(nor_df)[names(nor_df) == date_col] <- "date"
if (col_mean  %in% names(nor_df))  names(nor_df)[names(nor_df) == col_mean]  <- "math"
if (col_lower %in% names(nor_df))  names(nor_df)[names(nor_df) == col_lower] <- "math_lower"
if (col_upper %in% names(nor_df))  names(nor_df)[names(nor_df) == col_upper] <- "math_upper"

# --- parse/clean date, sort ---
if (is.character(nor_df$date)) {
  suppressWarnings({
    dt <- as.Date(nor_df$date)
    if (all(!is.na(dt))) nor_df$date <- dt
  })
}
nor_df <- nor_df[order(nor_df$date), ]

# --- compact metadata for the bundle ---
`%||%` <- function(a, b) if (!is.null(a)) a else b
citation_text <- paste0(
  "Source: OECD (2023) ??? with minor processing by Our World in Data. ",
  "Indicator: PISA mathematics (mean) with lower/upper uncertainty bounds. ",
  "Note: OECD PISA scales are benchmarked to mean 500 and SD 100 for OECD at baseline; later cycles are calibrated for comparability."
)

meta_compact <- list(
  title       = metadata$title %||% "Average performance of 15-year-olds in mathematics (PISA)",
  variables   = list(mean = "math", lower = "math_lower", upper = "math_upper"),
  unit        = metadata$unit %||% "PISA score",
  description = metadata$description %||% NULL,
  owidTags    = metadata$owidTags %||% NULL,
  dataPublishedBy    = metadata$dataPublishedBy %||% NULL,
  dataPublisherSource = metadata$dataPublisherSource %||% NULL,
  lastUpdated = metadata$lastUpdated %||% NULL,
  retrieved   = as.character(Sys.Date()),
  source_and_citation = citation_text
)

# --- assemble bundle (wide records) ---
records <- subset(nor_df, select = c("Entity","Code","date",
                                     intersect(c("math","math_lower","math_upper"), names(nor_df))))

bundle <- list(
  dataset = "pisa-test-score-mean-performance-on-the-mathematics-scale (OECD PISA, OWID processed)",
  country = "Norway",
  metadata = meta_compact,
  data = records
)

# --- write JSON artifacts (UTF-8) ---
jsonlite::write_json(bundle,  "norway_pisa_math.json",         pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(records, "norway_pisa_math_records.json", pretty = TRUE, auto_unbox = TRUE)

# --- NDJSON (one line per year) ---
con <- file("norway_pisa_math.ndjson", open = "w", encoding = "UTF-8")
apply(records, 1, function(row) writeLines(jsonlite::toJSON(as.list(row), auto_unbox = TRUE), con = con))
close(con)

cat("Wrote:\n",
    " - norway_pisa_math.json\n",
    " - norway_pisa_math_records.json\n",
    " - norway_pisa_math.ndjson\n")
