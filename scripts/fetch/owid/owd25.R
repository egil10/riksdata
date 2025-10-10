# --- packages ---
library(jsonlite)

# --- OWID API URLs (Norway only) ---
data_url <- "https://ourworldindata.org/grapher/researchers-in-rd-per-million-people.csv?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR&mapSelect=~NOR"
meta_url <- "https://ourworldindata.org/grapher/researchers-in-rd-per-million-people.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR&mapSelect=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)
metadata <- jsonlite::fromJSON(meta_url)

# --- choose the value column robustly ---
candidates <- setdiff(names(df), c("Entity", "Code", "Year", "Day", "Date"))
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

# prefer obvious names, then first numeric
prefs <- c("^sp_pop_scie_rd_p6$", "researchers", "per\\s*million", "value|vals|count|number")
match_idx <- which(Reduce(`|`, lapply(prefs, function(p) grepl(p, candidates, ignore.case = TRUE))))
value_col <- if (length(match_idx)) candidates[match_idx[1]] else {
  num_flags <- vapply(df[candidates], is.numeric, logical(1))
  num_candidates <- candidates[num_flags]
  if (!length(num_candidates)) stop("No numeric value column found.")
  num_candidates[1]
}

# --- pick a date-like column (OWID usually 'Year') ---
date_col <- if ("Date" %in% names(df)) "Date" else if ("Day" %in% names(df)) "Day" else "Year"

# --- filter, rename, sort ---
nor_df <- subset(df, Entity == "Norway", select = c("Entity", "Code", date_col, value_col))
names(nor_df)[names(nor_df) == value_col] <- "value"
names(nor_df)[names(nor_df) == date_col]  <- "date"

# parse date if ISO strings; keep numeric years as-is
if (is.character(nor_df$date)) {
  suppressWarnings({
    dt <- as.Date(nor_df$date)
    if (all(!is.na(dt))) nor_df$date <- dt
  })
}

nor_df <- nor_df[order(nor_df$date), ]

# --- compact metadata for the bundle ---
`%||%` <- function(a, b) if (!is.null(a)) a else b
citation_text <- paste(
  "Source: UNESCO Institute for Statistics (UIS), via World Bank (2025) ??? processed by Our World in Data.",
  "Indicator: Researchers in R&D (per million people).",
  "Note: Postgraduate students are included."
)

meta_compact <- list(
  title       = metadata$title %||% "Number of R&D researchers per million people",
  variable    = value_col,
  unit        = metadata$unit %||% "per million people",
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
  dataset = "researchers-in-rd-per-million-people (UIS via World Bank, OWID processed)",
  country = "Norway",
  metadata = meta_compact,
  data = nor_df
)

# --- write JSON artifacts (UTF-8) ---
jsonlite::write_json(out,      "norway_rnd_researchers.json",         pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_rnd_researchers_records.json", pretty = TRUE, auto_unbox = TRUE)

# --- write NDJSON (one record per line) ---
con <- file("norway_rnd_researchers.ndjson", open = "w", encoding = "UTF-8")
apply(nor_df, 1, function(row) writeLines(jsonlite::toJSON(as.list(row), auto_unbox = TRUE), con = con))
close(con)

cat("Wrote:\n",
    " - norway_rnd_researchers.json\n",
    " - norway_rnd_researchers_records.json\n",
    " - norway_rnd_researchers.ndjson\n")
