# oslo_indices_series.R (more robust)
# OSEAX + OSEBX with auto-fallback (incl. OSEFX) and flexible frequency to JSON

# ---- helper: ensure packages ----
need <- c("tidyquant","dplyr","lubridate","jsonlite","purrr","tidyr","rlang","tibble")
has  <- need %in% rownames(installed.packages())
if (any(!has)) install.packages(need[!has], repos = "https://cloud.r-project.org")

suppressPackageStartupMessages({
  library(tidyquant)
  library(dplyr)
  library(lubridate)
  library(jsonlite)
  library(purrr)
  library(tidyr)
  library(rlang)
  library(tibble)
})

# ====== CONFIG ======
# Choose: "monthly", "weekly", "daily", or "quarterly"
freq <- "monthly"

# Candidate symbols to try (ordered by preference)
candidates <- list(
  OSEAX = c("^OSEAX", "OSEAX.OL", "OSEAX"),
  OSEBX = c("^OSEBX", "OSEBX.OL", "OSEBX", "^OSEFX", "OSEFX")
)

out_file <- "oslo_indices_series.json"

# ====== FUNCTIONS ======
fetch_one <- function(sym) {
  df <- tryCatch(
    suppressWarnings(tq_get(sym, get = "stock.prices")),
    error = function(e) NULL
  )
  
  # Guard against odd returns (non-DF, zero rows, or missing columns)
  if (is.null(df) || NROW(df) == 0) return(NULL)
  if (!is.data.frame(df)) {
    # try to coerce; if still not usable, bail
    df <- tryCatch(as_tibble(df), error = function(e) NULL)
    if (is.null(df) || NROW(df) == 0) return(NULL)
  }
  
  value_col <- if ("adjusted" %in% names(df)) "adjusted" else "close"
  if (!("date" %in% names(df)) || !(value_col %in% names(df))) return(NULL)
  
  df <- df %>%
    transmute(date = as.Date(date), value = .data[[value_col]]) %>%
    filter(!is.na(date), !is.na(value)) %>%
    arrange(date)
  
  if (NROW(df) == 0) return(NULL)
  list(symbol = sym, data = df)
}

fetch_best_working <- function(sym_list) {
  res <- map(sym_list, fetch_one) |> compact()
  if (length(res) == 0) return(NULL)
  
  meta <- map_df(res, ~{
    tibble(
      symbol = .x$symbol,
      start  = suppressWarnings(min(.x$data$date, na.rm = TRUE)),
      end    = suppressWarnings(max(.x$data$date, na.rm = TRUE)),
      n      = NROW(.x$data)
    )
  }) %>%
    filter(!is.na(end), !is.na(start))
  
  if (nrow(meta) == 0) return(NULL)
  
  best_sym <- meta %>% arrange(desc(end), desc(n)) %>% slice(1) %>% pull(symbol)
  keep(res, ~.x$symbol == best_sym)[[1]]
}

to_period <- function(daily_df, freq = "monthly") {
  f <- tolower(freq)
  if (f == "daily") {
    return(daily_df %>% transmute(date, value))
  }
  if (f %in% c("weekly","monthly","quarterly")) {
    unit <- switch(f,
                   weekly   = "week",
                   monthly  = "month",
                   quarterly= "quarter")
    daily_df %>%
      mutate(bucket = floor_date(date, unit)) %>%
      group_by(bucket) %>%
      slice_tail(n = 1) %>%
      ungroup() %>%
      transmute(date = bucket, value)
  } else {
    warning(sprintf("Unknown freq='%s'. Falling back to monthly.", freq))
    to_period(daily_df, "monthly")
  }
}

as_json_series <- function(df) {
  pmap(df, \(date, value) list(date = as.character(date), value = unname(value)))
}

warn_if_stale <- function(label, end_date) {
  days_old <- as.integer(Sys.Date() - as.Date(end_date))
  if (!is.na(days_old) && days_old > 120) {
    message(sprintf("Warning: %s series ends %d days ago (%s). Data source may be stale.",
                    label, days_old, as.character(end_date)))
  }
}

# ====== MAIN ======
results <- list()

for (idx in names(candidates)) {
  best <- fetch_best_working(candidates[[idx]])
  if (is.null(best)) {
    stop(sprintf("Could not retrieve any data for %s with tried symbols: %s",
                 idx, paste(candidates[[idx]], collapse = ", ")))
  }
  series <- to_period(best$data, freq)
  warn_if_stale(idx, max(series$date, na.rm = TRUE))
  results[[idx]] <- list(
    symbol_used = best$symbol,
    frequency   = freq,
    start_date  = as.character(min(series$date, na.rm = TRUE)),
    end_date    = as.character(max(series$date, na.rm = TRUE)),
    n_points    = nrow(series),
    data        = as_json_series(series)
  )
}

payload <- list(
  disclaimer   = "Best-effort retrieval from Yahoo Finance via tidyquant; index symbols can be incomplete or revised. OSEBX may fall back to OSEFX if fresher.",
  generated_at = as.character(with_tz(Sys.time(), tzone = "UTC")),
  indices      = results
)

write_json(payload, path = out_file, pretty = TRUE, auto_unbox = TRUE)

message(sprintf(
  "Wrote %s with %d points for OSEAX (using %s) and %d points for OSEBX (using %s) at %s frequency.",
  out_file,
  results$OSEAX$n_points, results$OSEAX$symbol_used,
  results$OSEBX$n_points, results$OSEBX$symbol_used,
  freq
))
