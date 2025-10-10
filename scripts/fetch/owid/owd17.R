# --- packages ---
library(jsonlite)

# --- OWID API URLs (Armed forces personnel ??? filtered to Norway) ---
data_url <- "https://ourworldindata.org/grapher/armed-forces-personnel.csv?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"
meta_url <-  "https://ourworldindata.org/grapher/armed-forces-personnel.metadata.json?v=1&csvType=filtered&useColumnShortNames=true&tab=line&country=~NOR"

# --- fetch ---
df <- read.csv(data_url, check.names = FALSE)
metadata <- jsonlite::fromJSON(meta_url)

# --- pick the value column robustly ---
candidates <- setdiff(names(df), c("Entity", "Code", "Year"))
# drop helper columns like annotations/notes/CI
candidates <- candidates[!grepl("(annotations|notes?|ci|se)$|(-annotations$)", candidates, ignore.case = TRUE)]

# prefer columns that look like the series name (World Bank short code: ms_mil_totl_p1)
pref <- c("^ms_mil_totl_p1$", "armed", "mil", "personnel", "total")
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
  "Source: International Institute for Strategic Studies (IISS), via World Bank (2025) ???",
  "processed by Our World in Data. ???Armed forces personnel??? counts active-duty personnel,",
  "including paramilitary forces when organized and controlled to support/replace regular military."
)

meta_compact <- list(
  title       = metadata$title %||% "Armed forces personnel (total)",
  variable    = value_col,
  unit        = metadata$unit %||% "persons",
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
  dataset = "armed-forces-personnel (IISS via World Bank, OWID processed)",
  country = "Norway",
  metadata = meta_compact,
  data = norway_df
)

# --- write JSON (UTF-8) ---
jsonlite::write_json(out,      "norway_armed_forces_personnel.json",         pretty = TRUE, auto_unbox = TRUE)
jsonlite::write_json(out$data, "norway_armed_forces_personnel_records.json", pretty = TRUE, auto_unbox = TRUE)

cat("Wrote:\n - norway_armed_forces_personnel.json\n - norway_armed_forces_personnel_records.json\n")
