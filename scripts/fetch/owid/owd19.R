# --- packages ---
library(jsonlite)

# --- OWID API URLs (Trade as % of GDP ??? Norway only) ---
data_url <- "https://ourworldindata.org/grapher/trade-as-share-of-gdp.csv?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"
meta_url  <- "https://ourworldindata.org/grapher/trade-as-share-of-gdp.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)
metadata <- jsonlite::fromJSON(meta_url)

# --- pick the value column robustly ---
candidates <- setdiff(names(df), c("Entity", "Code", "Year"))
# drop helper/annotation columns just in case
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

# Prefer the World Bank short code if present (ne_trd_gnfs_zs), then fallbacks
pref <- c("^ne_trd_gnfs_zs$", "trade", "gdp", "share", "percent|%")
match_idx <- which(Reduce(`|`, lapply(pref, function(p) grepl(p, candidates, ignore.case = TRUE))))
value_col <- if (length(match_idx)) {
  candidates[match_idx[1]]
} else {
  num_flags <- vapply(df[candidates], is.numeric, logical(1))
  num_candidates <- candidates[num_flags]
  if (!length(num_candidates)) stop("No numeric value column found.")
  num_candidates[1]
}

# --- subset, rename, sort ---
norway_df <- subset(df, Entity == "Norway", select = c("Entity", "Code", "Year", value_col))
names(norway_df)[names(norway_df) == value_col] <- "value"
norway_df <- norway_df[order(norway_df$Year), ]

# --- compact metadata & citation ---
`%||%` <- function(a, b) if (!is.null(a)) a else b

citation_text <- paste(
  "Source: World Bank and OECD national accounts (2025) ??? processed by Our World in Data.",
  "Indicator: Trade as a share of GDP (sum of exports and imports as % of GDP).",
  "Also known as: trade openness index."
)

meta_compact <- list(
  title       = metadata$title %||% "Trade as a share of GDP (% of GDP)",
  variable    = value_col,
  unit        = metadata$unit %||% "% of GDP",
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
  dataset = "trade-as-share-of-gdp (World Bank & OECD national accounts, OWID processed)",
  country = "Norway",
  metadata = meta_compact,
  data = norway_df
)

# --- write JSON (UTF-8) ---
jsonlite::write_json(out,      "norway_trade_share_gdp.json",         pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_trade_share_gdp_records.json", pretty = TRUE, auto_unbox = TRUE)

# Optional: newline-delimited JSON (NDJSON), one row per line
con <- file("norway_trade_share_gdp.ndjson", open = "w", encoding = "UTF-8")
apply(norway_df, 1, function(row) writeLines(jsonlite::toJSON(as.list(row), auto_unbox = TRUE), con = con))
close(con)

cat("Wrote:\n",
    " - norway_trade_share_gdp.json\n",
    " - norway_trade_share_gdp_records.json\n",
    " - norway_trade_share_gdp.ndjson\n")
