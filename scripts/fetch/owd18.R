# --- packages ---
library(jsonlite)

# --- OWID API URLs (Total alcohol consumption per capita ??? Norway only) ---
data_url <- "https://ourworldindata.org/grapher/total-alcohol-consumption-per-capita-litres-of-pure-alcohol.csv?v=1&csvType=filtered&useColumnShortNames=true&tab=chart&country=~NOR"
meta_url <-  "https://ourworldindata.org/grapher/total-alcohol-consumption-per-capita-litres-of-pure-alcohol.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&tab=chart&country=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)
metadata <- jsonlite::fromJSON(meta_url)

# --- pick the value column robustly ---
candidates <- setdiff(names(df), c("Entity", "Code", "Year"))
# drop helper columns like annotations/notes/CI
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

# prefer columns that look like the series name (World Bank short code: sh_alc_pcap_li)
pref <- c("^sh_alc_pcap_li$", "alcohol", "pcap", "litre", "pure", "per.capita")
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
  "Source: World Health Organization, via World Bank (2025) ??? processed by Our World in Data.",
  "Series: Total alcohol consumption per capita (litres of pure alcohol, projected estimates, 15+ years of age).",
  "Unit: liters of pure alcohol per person (15+) per year."
)

meta_compact <- list(
  title       = metadata$title %||% "Total alcohol consumption per capita (litres of pure alcohol, 15+)",
  variable    = value_col,
  unit        = metadata$unit %||% "liters of pure alcohol per person (15+) per year",
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
  dataset = "total-alcohol-consumption-per-capita-litres-of-pure-alcohol (WHO via World Bank, OWID processed)",
  country = "Norway",
  metadata = meta_compact,
  data = norway_df
)

# --- write JSON (UTF-8) ---
jsonlite::write_json(out,      "norway_alcohol_consumption_per_capita.json",         pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_alcohol_consumption_per_capita_records.json", pretty = TRUE, auto_unbox = TRUE)

# Optional: newline-delimited JSON (NDJSON), one row per line
con <- file("norway_alcohol_consumption_per_capita.ndjson", open = "w", encoding = "UTF-8")
apply(norway_df, 1, function(row) writeLines(jsonlite::toJSON(as.list(row), auto_unbox = TRUE), con = con))
close(con)

cat("Wrote:\n",
    " - norway_alcohol_consumption_per_capita.json\n",
    " - norway_alcohol_consumption_per_capita_records.json\n",
    " - norway_alcohol_consumption_per_capita.ndjson\n")
