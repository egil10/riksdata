# --- packages ---
library(jsonlite)

# --- OWID API URLs (Norway only) ---
data_url <- "https://ourworldindata.org/grapher/international-tourist-trips.csv?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"
meta_url <- "https://ourworldindata.org/grapher/international-tourist-trips.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)
metadata <- jsonlite::fromJSON(meta_url)

# --- detect value column robustly ---
candidates <- setdiff(names(df), c("Entity", "Code", "Year", "Day", "Date"))
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

prefs <- c("^in_tour_arrivals_ovn_vis_tourists$", "arrivals", "tour", "value|vals|count|number")
match_idx <- which(Reduce(`|`, lapply(prefs, function(p) grepl(p, candidates, ignore.case = TRUE))))
value_col <- if (length(match_idx)) candidates[match_idx[1]] else {
  num_flags <- vapply(df[candidates], is.numeric, logical(1))
  num_candidates <- candidates[num_flags]
  if (!length(num_candidates)) stop("No numeric value column found.")
  num_candidates[1]
}

# --- pick a date-like column (OWID often uses 'Year') ---
date_col <- if ("Date" %in% names(df)) "Date" else if ("Day" %in% names(df)) "Day" else "Year"

# --- tidy for Norway, rename, sort ---
nor_df <- subset(df, Entity == "Norway", select = c("Entity", "Code", date_col, value_col))
names(nor_df)[names(nor_df) == value_col] <- "value"
names(nor_df)[names(nor_df) == date_col]  <- "date"

# Parse if date is character ISO; leave numeric years as-is
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
  "Source: UNWTO (2024) ??? processed by Our World in Data.",
  "Indicator: International tourist trips (inbound overnight arrivals).",
  "Unit: arrivals."
)

meta_compact <- list(
  title       = metadata$title %||% "International tourist trips",
  variable    = value_col,
  unit        = metadata$unit %||% "arrivals",
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
  dataset = "international-tourist-trips (UNWTO, OWID processed)",
  country = "Norway",
  metadata = meta_compact,
  data = nor_df
)

# --- write JSON artifacts (UTF-8) ---
jsonlite::write_json(out,      "norway_tourist_trips.json",         pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_tourist_trips_records.json", pretty = TRUE, auto_unbox = TRUE)

# --- write NDJSON (one record per line) ---
con <- file("norway_tourist_trips.ndjson", open = "w", encoding = "UTF-8")
apply(nor_df, 1, function(row) writeLines(jsonlite::toJSON(as.list(row), auto_unbox = TRUE), con = con))
close(con)

cat("Wrote:\n",
    " - norway_tourist_trips.json\n",
    " - norway_tourist_trips_records.json\n",
    " - norway_tourist_trips.ndjson\n")
