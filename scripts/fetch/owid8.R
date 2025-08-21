# --- packages ---
library(jsonlite)

# --- OWID API URLs (Global vaccination coverage) ---
data_url <- "https://ourworldindata.org/grapher/global-vaccination-coverage.csv?v=1&csvType=full&useColumnShortNames=true"
meta_url <- "https://ourworldindata.org/grapher/global-vaccination-coverage.metadata.json?v=1&csvType=full&useColumnShortNames=true"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)   # keep original column names
metadata <- jsonlite::fromJSON(meta_url)

# --- keep Norway only ---
df_no <- subset(df, Entity == "Norway")

# --- identify antigen columns robustly ---
non_value_cols <- c("Entity", "Code", "Year")
candidates <- setdiff(names(df_no), non_value_cols)

# drop helper/annotation columns and keep numeric series
drop_pattern <- "(annotations|notes?|ci|se)$|(-annotations$)"
candidates <- candidates[!grepl(drop_pattern, candidates, ignore.case = TRUE)]
num_flags <- vapply(df_no[candidates], is.numeric, logical(1))
value_cols <- candidates[num_flags]

if (length(value_cols) == 0) stop("No numeric vaccine coverage columns found.")

# --- reshape wide -> long (Year, antigen, value) using base R ---
vals <- df_no[value_cols]
long <- data.frame(
  Year = rep(df_no$Year, times = length(value_cols)),
  antigen = rep(value_cols, each = nrow(df_no)),
  value = as.numeric(unlist(vals, use.names = FALSE)),
  check.names = FALSE
)

# sort nicely
long <- long[order(long$Year, long$antigen), ]

# --- compact metadata & citation ---
`%||%` <- function(a, b) if (!is.null(a)) a else b

citation_text <- paste(
  "Data sources: WHO & UNICEF (2025); UN, World Population Prospects (2024) ???",
  "processed by Our World in Data. Please credit all sources listed above.",
  "Data provided by third-party sources through Our World in Data remains subject",
  "to the original providers' license terms."
)

meta_compact <- list(
  title       = metadata$title %||% "Vaccination coverage",
  variables   = value_cols,                      # all antigens present
  unit        = metadata$unit %||% "%",
  description = metadata$description %||% NULL,
  owidTags    = metadata$owidTags %||% NULL,
  dataPublishedBy    = metadata$dataPublishedBy %||% NULL,
  dataPublisherSource = metadata$dataPublisherSource %||% NULL,
  lastUpdated = metadata$lastUpdated %||% NULL,
  retrieved   = as.character(Sys.Date()),
  source_and_citation = citation_text
)

# --- build final JSON object ---
out <- list(
  dataset = "global-vaccination-coverage",
  country = "Norway",
  metadata = meta_compact,
  data = long
)

# --- write JSON (UTF-8) ---
jsonlite::write_json(out, "norway_vaccination_coverage.json", pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_vaccination_coverage_records.json", pretty = TRUE, auto_unbox = TRUE)

cat("Wrote:\n - norway_vaccination_coverage.json\n - norway_vaccination_coverage_records.json\n",
    "\nAntigens captured (", length(value_cols), "):\n  ",
    paste(value_cols, collapse = ", "), "\n", sep = "")
