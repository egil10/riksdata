# --- packages ---
library(jsonlite)

# --- OWID API URLs (Norway only) ---
data_url <- "https://ourworldindata.org/grapher/marriage-rate-per-1000-inhabitants.csv?v=1&csvType=filtered&useColumnShortNames=true&country=~NOR"
meta_url <- "https://ourworldindata.org/grapher/marriage-rate-per-1000-inhabitants.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&country=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)
metadata <- jsonlite::fromJSON(meta_url)

# --- pick the value column robustly ---
candidates <- setdiff(names(df), c("Entity", "Code", "Year"))
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

prefs <- c("^marriage_rate$", "per_?1000", "marriage|matrimon", "value|vals")
match_idx <- which(Reduce(`|`, lapply(prefs, function(p) grepl(p, candidates, ignore.case = TRUE))))
value_col <- if (length(match_idx)) {
  candidates[match_idx[1]]
} else {
  num_flags <- vapply(df[candidates], is.numeric, logical(1))
  num_candidates <- candidates[num_flags]
  if (!length(num_candidates)) stop("No numeric value column found.")
  num_candidates[1]
}

# --- tidy, rename, sort ---
nor_df <- subset(df, Entity == "Norway", select = c("Entity", "Code", "Year", value_col))
names(nor_df)[names(nor_df) == value_col] <- "value"
nor_df <- nor_df[order(nor_df$Year), ]

# --- compact metadata & citation ---
`%||%` <- function(a, b) if (!is.null(a)) a else b

citation_text <- paste(
  "Source: OECD (2024); US Census Bureau (1949); Centers for Disease Control and Prevention (2020) ???",
  "processed by Our World in Data.",
  "Indicator: Crude marriage rate (marriages per 1,000 people)."
)

meta_compact <- list(
  title       = metadata$title %||% "Marriage rates (crude, per 1,000 people)",
  variable    = value_col,
  unit        = metadata$unit %||% "per 1,000 people",
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
  dataset = "marriage-rate-per-1000-inhabitants (OECD + US Census + CDC, OWID processed)",
  country = "Norway",
  metadata = meta_compact,
  data = nor_df
)

# --- write JSON artifacts (UTF-8) ---
jsonlite::write_json(out,      "norway_marriage_rate.json",         pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_marriage_rate_records.json", pretty = TRUE, auto_unbox = TRUE)

# --- write NDJSON (one record per line) ---
con <- file("norway_marriage_rate.ndjson", open = "w", encoding = "UTF-8")
apply(nor_df, 1, function(row) writeLines(jsonlite::toJSON(as.list(row), auto_unbox = TRUE), con = con))
close(con)

cat("Wrote:\n",
    " - norway_marriage_rate.json\n",
    " - norway_marriage_rate_records.json\n",
    " - norway_marriage_rate.ndjson\n")
