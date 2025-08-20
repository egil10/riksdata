# install.packages(c("tidyquant","dplyr","purrr","lubridate","jsonlite","stringr","tibble"))
library(tidyquant)
library(dplyr)
library(purrr)
library(lubridate)
library(jsonlite)
library(stringr)
library(tibble)

# ---- Config ----
from_date <- as.Date("2013-03-05")
to_date   <- Sys.Date()

series <- tribble(
  ~id,     ~name,                                   ~yahoo,     ~currency,
  "OSEAX", "Oslo B??rs All-Share Index (OSEAX)",     "^OSEAX",   "NOK",
  "OSEBX", "Oslo B??rs Benchmark Index (OSEBX)",     "OSEBX.OL", "NOK",
  "OBX",   "OBX Total Return Index (OBX)",          "OBX.OL",   "NOK"
)

# ---- Helper: fetch monthly adjusted close (EOM) ----
fetch_monthly <- function(sym) {
  tq_get(sym, from = from_date, to = to_date, warnings = FALSE) %>%
    group_by(symbol) %>%
    tq_transmute(select = adjusted,
                 mutate_fun = to.period,
                 period = "months") %>%     # <- no OHLC arg here
    ungroup() %>%
    transmute(date = as.Date(date), value = as.numeric(adjusted)) %>%
    tidyr::drop_na()
}

# ---- Helper: write riksdata-style JSON ----
write_riksdata_json <- function(id, name, currency, df, out_path){
  meta <- list(
    source       = "Yahoo Finance",
    id           = id,
    name         = name,
    description  = "Monthly adjusted close (split/dividend-adjusted). For indices this equals close.",
    frequency    = "monthly",
    unit         = "index points",
    currency     = currency,
    last_updated = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
    date_range   = list(
      start = format(min(df$date), "%Y-%m-%d"),
      end   = format(max(df$date), "%Y-%m-%d")
    )
  )
  data_nodes <- map2(
    format(df$date, "%Y-%m-%d"),
    df$value,
    ~list(date = .x, value = .y)
  )
  obj <- list(metadata = meta, data = data_nodes)
  write_json(obj, out_path, pretty = TRUE, auto_unbox = TRUE)
}

# ---- Fetch and write ----
monthly_list <- series %>%
  mutate(data = map(yahoo, fetch_monthly))

pwalk(
  list(series$id, series$name, series$currency, monthly_list$data,
       paste0(tolower(series$id), ".json")),
  write_riksdata_json
)

# (Optional) If you prefer first-of-month dating:
# monthly_list <- monthly_list %>% mutate(data = map(data, ~mutate(.x, date = floor_date(date, "month"))))
# then re-run the pwalk() block above.
