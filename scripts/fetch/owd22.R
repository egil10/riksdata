# --- packages ---
library(jsonlite)

# --- OWID API URLs (Norway only) ---
data_url <- "https://ourworldindata.org/grapher/electric-car-sales-share.csv?v=1&csvType=filtered&useColumnShortNames=true&country=~NOR"
meta_url <- "https://ourworldindata.org/grapher/electric-car-sales-share.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&country=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)
metadata <- jsonlite::fromJSON(meta_url)

# --- pick the value column robustly ---
candidates <- setdiff(names(df), c("Entity", "Code", "Year"))
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

prefs <- c("^ev_sales_share$", "electric", "share", "value|vals|percent|pct")
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

# --- helpers ---
`%||%` <- function(a, b) if (!is.null(a)) a else b

# --- compact metadata & citation ---
citation_text <- paste(
  "Source: International Energy Agency. Global EV Outlook 2025 ???",
  "processed by Our World in Data.",
  "Indicator: Share of new cars sold that are electric (battery-electric + plug-in hybrid).",
  "Unit: percent of new car sales."
)

meta_compact <- list(
  title       = metadata$title %||% "Share of new cars sold that are electric",
  variable    = value_col,
  unit        = metadata$unit %||% "%",
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
  dataset = "electric-car-sales-share (IEA Global EV Outlook 2025, OWID processed)",
  country = "Norway",
  metadata = meta_compact,
  data = nor_df
)

# --- write JSON artifacts (UTF-8) ---
jsonlite::write_json(out,      "norway_electric_car_sales_share.json",         pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_electric_car_sales_share_records.json", pretty = TRUE, auto_unbox = TRUE)

# --- write NDJSON (one record per line) ---
con <- file("norway_electric_car_sales_share.ndjson", open = "w", encoding = "UTF-8")
apply(nor_df, 1, function(row) writeLines(jsonlite::toJSON(as.list(row), auto_unbox = TRUE), con = con))
close(con)

cat("Wrote:\n",
    " - norway_electric_car_sales_share.json\n",
    " - norway_electric_car_sales_share_records.json\n",
    " - norway_electric_car_sales_share.ndjson\n")
