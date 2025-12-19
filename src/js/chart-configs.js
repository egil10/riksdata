// ============================================================================
// CHART CONFIGURATIONS - ONLY WORKING CHARTS
// ============================================================================
// Metadata (subtitle, sourceUrl, sourceName) is auto-inferred from URL in main.js

export const chartConfigs = [
    // === SSB CHARTS (ALL 125 FILES) ===
    // Core Economic Indicators
    { id: 'unemployment-chart', url: 'https://data.ssb.no/api/v0/dataset/1054.json?lang=no', title: 'Arbeidsledighet', subtitle: 'Prosent' },
    { id: 'house-prices-chart', url: 'https://data.ssb.no/api/v0/dataset/1060.json?lang=no', title: 'Boligprisindeks' },

    // Bygg & Bolig
    { id: 'construction-costs-chart', url: 'https://data.ssb.no/api/v0/dataset/26944.json?lang=no', title: 'Byggekostnader' },
    { id: 'construction-cost-multi-chart', url: 'https://data.ssb.no/api/v0/dataset/1058.json?lang=no', title: 'Byggekostnadsindeks (Enebolig)' },
    { id: 'construction-cost-wood-chart', url: 'https://data.ssb.no/api/v0/dataset/1056.json?lang=no', title: 'Byggekostnadsindeks (Trehus)' },
    { id: 'construction-production-index-chart', url: 'https://data.ssb.no/api/v0/dataset/924808.json?lang=no', title: 'Produksjonsindeks for Bygg og Anlegg', subtitle: 'Indeks' },
    { id: 'house-price-index-recent-chart', url: 'https://data.ssb.no/api/v0/dataset/1061.json?lang=no', title: 'Boligprisindeks (Siste data)' },
    { id: 'new-detached-house-prices-national-chart', url: 'https://data.ssb.no/api/v0/dataset/25151.json?lang=no', title: 'Pris per m² nye eneboliger', subtitle: 'NOK per m²' },
    { id: 'new-dwellings-price-chart', url: 'https://data.ssb.no/api/v0/dataset/26158.json?lang=no', title: 'Pris per m² nye boliger', subtitle: 'NOK per m²' },
    { id: 'holiday-property-sales-chart', url: 'https://data.ssb.no/api/v0/dataset/65962.json?lang=no', title: 'Omsetning av fritidsboliger', subtitle: 'Antall' },

    // Industri & Produksjon
    { id: 'producer-price-industry-chart', url: 'https://data.ssb.no/api/v0/dataset/741023.json?lang=no', title: 'Produsentprisindeks for industri' },
    { id: 'production-index-by-industry-chart', url: 'https://data.ssb.no/api/v0/dataset/27002.json?lang=no', title: 'Produksjonsindeks for industri' },
    { id: 'production-index-industry-recent-chart', url: 'https://data.ssb.no/api/v0/dataset/26953.json?lang=no', title: 'Produksjonsindeks industri (Siste data)' },

    // Handel & Eksport/Import
    { id: 'export-volume-chart', url: 'https://data.ssb.no/api/v0/dataset/179421.json?lang=no', title: 'Eksportvolum', subtitle: 'Millioner NOK' },
    { id: 'import-value-volume-sitc-chart', url: 'https://data.ssb.no/api/v0/dataset/34640.json?lang=no', title: 'Importverdi (SITC)', subtitle: 'Millioner NOK' },
    { id: 'export-value-volume-sitc-chart', url: 'https://data.ssb.no/api/v0/dataset/34642.json?lang=no', title: 'Eksportverdi (SITC)', subtitle: 'Millioner NOK' },
    { id: 'import-value-volume-sitc1-chart', url: 'https://data.ssb.no/api/v0/dataset/34254.json?lang=no', title: 'Importverdi (Varegrupper)', subtitle: 'Millioner NOK' },
    { id: 'export-value-volume-sitc1-chart', url: 'https://data.ssb.no/api/v0/dataset/34256.json?lang=no', title: 'Eksportverdi (Varegrupper)', subtitle: 'Millioner NOK' },
    { id: 'import-value-sitc3-chart', url: 'https://data.ssb.no/api/v0/dataset/34641.json?lang=no', title: 'Importverdi (Detaljert SITC)', subtitle: 'Millioner NOK' },
    { id: 'export-value-sitc3-chart', url: 'https://data.ssb.no/api/v0/dataset/34643.json?lang=no', title: 'Eksportverdi (Detaljert SITC)', subtitle: 'Millioner NOK' },
    { id: 'trade-volume-price-bec-chart', url: 'https://data.ssb.no/api/v0/dataset/179415.json?lang=no', title: 'Utenrikshandel Volumpris (BEC)', subtitle: 'Millioner NOK' },
    { id: 'trade-volume-price-product-groups-chart', url: 'https://data.ssb.no/api/v0/dataset/179417.json?lang=no', title: 'Utenrikshandel Volumpris (Varegrupper)', subtitle: 'Millioner NOK' },
    { id: 'trade-volume-price-sitc2-chart', url: 'https://data.ssb.no/api/v0/dataset/179418.json?lang=no', title: 'Utenrikshandel Volumpris (SITC2)', subtitle: 'Millioner NOK' },
    { id: 'trade-main-figures-recent-chart', url: 'https://data.ssb.no/api/v0/dataset/179419.json?lang=no', title: 'Utenrikshandel Hovedtall (Siste data)', subtitle: 'Millioner NOK' },
    { id: 'export-country-chart', url: 'https://data.ssb.no/api/v0/dataset/1130.json?lang=no', title: 'Eksport etter land' },
    { id: 'export-commodity-chart', url: 'https://data.ssb.no/api/v0/dataset/1134.json?lang=no', title: 'Eksport etter vare' },
    { id: 'import-commodity-chart', url: 'https://data.ssb.no/api/v0/dataset/1140.json?lang=no', title: 'Import etter vare' },
    { id: 'export-by-country-monthly-chart', url: 'https://data.ssb.no/api/v0/dataset/1130.json?lang=no', title: 'Eksport etter land (Månedlig)' },
    { id: 'import-by-country-monthly-chart', url: 'https://data.ssb.no/api/v0/dataset/1132.json?lang=no', title: 'Import etter land (Månedlig)' },

    // Næringsliv & Tiltro
    { id: 'business-confidence-chart', url: 'https://data.ssb.no/api/v0/dataset/166316.json?lang=no', title: 'Tiltro til næringslivet', subtitle: 'Indeks' },
    { id: 'business-cycle-barometer-products-chart', url: 'https://data.ssb.no/api/v0/dataset/166317.json?lang=no', title: 'Konjunkturbarometer for industrien', subtitle: 'Indeks' },
    { id: 'business-cycle-barometer-chart', url: 'https://data.ssb.no/api/v0/dataset/166318.json?lang=no', title: 'Konjunkturbarometer', subtitle: 'Indeks' },
    { id: 'consumer-confidence-chart', url: 'https://data.ssb.no/api/v0/dataset/166316.json?lang=no', title: 'Forbrukertillit', subtitle: 'Indeks' },
    { id: 'bankruptcies-chart', url: 'https://data.ssb.no/api/v0/dataset/924816.json?lang=no', title: 'Konkurser', subtitle: 'Antall' },
    { id: 'bankruptcies-by-industry-chart', url: 'https://data.ssb.no/api/v0/dataset/924816.json?lang=no', title: 'Konkurser etter næring', subtitle: 'Antall' },

    // Penger & Kreditt
    { id: 'money-supply-m0-chart', url: 'https://data.ssb.no/api/v0/dataset/172771.json?lang=no', title: 'Pengemengde M0', subtitle: 'Millioner NOK' },
    { id: 'credit-indicator-chart', url: 'https://data.ssb.no/api/v0/dataset/166326.json?lang=no', title: 'Kredittindikator', subtitle: 'Millioner NOK' },

    // Energi & Miljø
    { id: 'energy-consumption-chart', url: 'https://data.ssb.no/api/v0/dataset/928196.json?lang=no', title: 'Energiforbruk', subtitle: 'Terajoule' },
    { id: 'greenhouse-gas-emissions-chart', url: 'https://data.ssb.no/api/v0/dataset/832678.json?lang=no', title: 'Utslipp av klimagasser', subtitle: 'CO2-ekvivalenter' },
    { id: 'greenhouse-gas-chart', url: 'https://data.ssb.no/api/v0/dataset/832678.json?lang=no', title: 'Klimagasser', subtitle: 'CO2-ekvivalenter' },

    // Offentlig sektor
    { id: 'government-revenue-chart', url: 'https://data.ssb.no/api/v0/dataset/928194.json?lang=no', title: 'Statens inntekter', subtitle: 'Millioner NOK' },
    { id: 'public-administration-expenditures-chart', url: 'https://data.ssb.no/api/v0/dataset/112175.json?lang=no', title: 'Utgifter i offentlig forvaltning', subtitle: 'Millioner NOK' },
    { id: 'tax-returns-main-items-chart', url: 'https://data.ssb.no/api/v0/dataset/49656.json?lang=no', title: 'Selvangivelse hovedtall', subtitle: 'Millioner NOK' },
    { id: 'economic-forecasts-chart', url: 'https://data.ssb.no/api/v0/dataset/934513.json?lang=no', title: 'Økonomiske prognoser', subtitle: 'BNP-vekst %' },
    { id: 'economic-forecasts-selected-chart', url: 'https://data.ssb.no/api/v0/dataset/934514.json?lang=no', title: 'Utvalgte økonomiske prognoser', subtitle: 'BNP-vekst %' },
    { id: 'national-accounts-recent-chart', url: 'https://data.ssb.no/api/v0/dataset/59013.json?lang=no', title: 'Nasjonalregnskap (Siste data)', subtitle: 'Millioner NOK' },
    { id: 'international-accounts-chart', url: 'https://data.ssb.no/api/v0/dataset/924820.json?lang=no', title: 'Utenriksregnskap', subtitle: 'Millioner NOK' },

    // Arbeid & Lønn
    { id: 'labour-cost-index-chart', url: 'https://data.ssb.no/api/v0/dataset/760065.json?lang=no', title: 'Arbeidskraftkostnadsindeks' },
    { id: 'basic-salary-chart', url: 'https://data.ssb.no/api/v0/dataset/1126.json?lang=no', title: 'Grunnlønnindeks' },
    { id: 'wage-chart', url: './data/cached/ssb/wage-indices-by-industry.json', title: 'Lønnsindeks', subtitle: 'Indeks (2015=100)', type: 'line' },
    { id: 'employed-by-residence-workplace-chart', url: 'https://data.ssb.no/api/v0/dataset/1054.json?lang=no', title: 'Sysselsatte etter bosted og arbeidssted' },

    // Olje & Gass
    { id: 'oil-gas-investment-chart', url: 'https://data.ssb.no/api/v0/dataset/166334.json?lang=no', title: 'Investeringer i olje og gass', subtitle: 'Millioner NOK' },
    { id: 'oil-gas-industry-turnover-chart', url: 'https://data.ssb.no/api/v0/dataset/124341.json?lang=no', title: 'Omsetning i olje og gass', subtitle: 'Millioner NOK' },
    { id: 'oil-gas-industry-turnover-sn2007-chart', url: 'https://data.ssb.no/api/v0/dataset/124322.json?lang=no', title: 'Omsetning i olje og gass (SN2007)', subtitle: 'Millioner NOK' },
    { id: 'oil-gas-turnover-chart', url: 'https://data.ssb.no/api/v0/dataset/124341.json?lang=no', title: 'Total omsetning i olje- og gassutvinning', subtitle: 'Millioner NOK' },

    // Forskning & Utvikling
    { id: 'r-d-expenditure-chart', url: 'https://data.ssb.no/api/v0/dataset/61819.json?lang=no', title: 'FoU-utgifter', subtitle: 'Millioner NOK' },

    // Varehandel
    { id: 'retail-sales-chart', url: 'https://data.ssb.no/api/v0/dataset/1064.json?lang=no', title: 'Detaljomsetning', subtitle: 'Indeks' },
    { id: 'salmon-export-value-chart', url: 'https://data.ssb.no/api/v0/dataset/1122.json?lang=no', title: 'Eksportverdi for laks', subtitle: 'Millioner NOK' },
    { id: 'salmon-export-volume-chart', url: 'https://data.ssb.no/api/v0/dataset/1120.json?lang=no', title: 'Eksportvolum for laks', subtitle: 'Tonn' },

    // Befolkning & Demografi
    { id: 'population-growth-chart', url: './data/cached/ssb/population-growth.json', title: 'Befolkningsvekst', subtitle: 'Personer', type: 'line' },
    { id: 'population-age-chart', url: './data/cached/ssb/population-age.json', title: 'Befolkning etter alder', subtitle: 'Personer', type: 'line' },
    { id: 'population-development-quarterly-chart', url: './data/cached/ssb/population-development-quarterly.json', title: 'Befolkningsutvikling (Kvartalsvis)', subtitle: 'Personer', type: 'line' },

    // Husholdning & Levekår
    { id: 'household-income-chart', url: 'https://data.ssb.no/api/v0/dataset/56900.json?lang=no', title: 'Husholdningsinntekt', subtitle: 'Median NOK' },
    { id: 'household-income-national-chart', url: 'https://data.ssb.no/api/v0/dataset/56957.json?lang=no', title: 'Husholdningsinntekt (Nasjonalt)', subtitle: 'Median NOK' },
    { id: 'household-income-size-chart', url: 'https://data.ssb.no/api/v0/dataset/56957.json?lang=no', title: 'Husholdningsinntekt etter størrelse', subtitle: 'Median NOK' },
    { id: 'household-consumption-chart', url: 'https://data.ssb.no/api/v0/dataset/166330.json?lang=no', title: 'Husholdningenes konsum' },
    { id: 'household-types-chart', url: 'https://data.ssb.no/api/v0/dataset/1068.json?lang=no', title: 'Husholdningstyper', subtitle: 'Antall' },
    { id: 'cohabiting-arrangements-chart', url: 'https://data.ssb.no/api/v0/dataset/85440.json?lang=no', title: 'Samboerforhold', subtitle: 'Antall' },
    { id: 'living-arrangements-national-chart', url: 'https://data.ssb.no/api/v0/dataset/86813.json?lang=no', title: 'Boformer (Nasjonalt)', subtitle: 'Antall' },
    { id: 'utility-floor-space-chart', url: 'https://data.ssb.no/api/v0/dataset/95177.json?lang=no', title: 'Bruksareal', subtitle: 'Kvadratmeter' },

    // Sosialt & Helse
    { id: 'crime-rate-chart', url: 'https://data.ssb.no/api/v0/dataset/97445.json?lang=no', title: 'Kriminalitet', subtitle: 'Årlig antall' },
    { id: 'education-level-chart', url: 'https://data.ssb.no/api/v0/dataset/85454.json?lang=no', title: 'Utdanningsnivå', subtitle: 'Prosent' },
    { id: 'lifestyle-habits-chart', url: 'https://data.ssb.no/api/v0/dataset/832683.json?lang=no', title: 'Livsstilsvaner', subtitle: 'Prosent' },
    { id: 'long-term-illness-chart', url: 'https://data.ssb.no/api/v0/dataset/832685.json?lang=no', title: 'Langvarig sykdom', subtitle: 'Prosent' },

    // === PRISINDEKSER ===
    { id: 'ppi-chart', url: './data/cached/ssb/ppi.json', title: 'Produsentprisindeks (PPI)', subtitle: 'Indeks', type: 'line' },
    { id: 'first-hand-price-index-chart', url: 'https://data.ssb.no/api/v0/dataset/82677.json?lang=no', title: 'Prisindeks for førstegangsomsetning' },
    { id: 'first-hand-price-index-groups-chart', url: 'https://data.ssb.no/api/v0/dataset/82679.json?lang=no', title: 'Prisindeks for førstegangsomsetning (Varegrupper)' },
    { id: 'first-hand-price-index-subgroups-chart', url: 'https://data.ssb.no/api/v0/dataset/82681.json?lang=no', title: 'Prisindeks for førstegangsomsetning (Undergrupper)' },

    // === NORGES BANK - VALUTA & RENTE ===
    { id: 'key-policy-rate-chart', url: './data/cached/norges-bank/interest-rate.json', title: 'Styringsrente', subtitle: 'Prosent', type: 'line' },
    { id: 'i44-nok-chart', url: './data/cached/norges-bank/exchange-rates/i44.json', title: 'I44/NOK Valutakurs', subtitle: 'Norske kroner per I44-indeks', type: 'line' },

    // === OSLO BØRS INDEKSER ===
    { id: 'oseax-chart', url: './data/cached/oslo-indices/oseax.json', title: 'OSEAX - Oslo Børs Hovedindeks', subtitle: 'Indeksverdi', type: 'line' },

    // === NVE VANNMAGASIN (Fordelt på områder) ===
    { id: 'nve-norge-reservoir-chart', url: './data/cached/nve/norge-reservoir.json', title: 'Magasinfylling - Norge (Total)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-no1-reservoir-chart', url: './data/cached/nve/no1-reservoir.json', title: 'Magasinfylling - NO1 (Østlandet)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-no2-reservoir-chart', url: './data/cached/nve/no2-reservoir.json', title: 'Magasinfylling - NO2 (Sørlandet)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-no3-reservoir-chart', url: './data/cached/nve/no3-reservoir.json', title: 'Magasinfylling - NO3 (Vestlandet)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-no4-reservoir-chart', url: './data/cached/nve/no4-reservoir.json', title: 'Magasinfylling - NO4 (Trøndelag)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-no5-reservoir-chart', url: './data/cached/nve/no5-reservoir.json', title: 'Magasinfylling - NO5 (Nord-Norge)', subtitle: 'Magasinfylling %', type: 'line' },
    { id: 'nve-reservoir-fill-chart', url: './data/static/nve-reservoir-fill.json', title: 'Årlig magasinfylling', subtitle: 'Prosent', type: 'line' },

    // === BANKRUPTCIES TOTAL ===
    { id: 'bankruptcies-total-chart', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-total.json', title: 'Konkurser - Totalt (Alle næringer)', subtitle: 'Antall per kvartal', type: 'line' },

    // === SSB CPI (Konsumprisindeks) ===
    { id: 'cpi-chart', url: './data/cached/ssb/cpi.json', title: 'Konsumprisindeks (KPI)', subtitle: 'Indeks (2015=100)', type: 'line' },

    // === SSB IMPORT ETTER LAND ===
    { id: 'import-country-chart', url: './data/cached/ssb/import-country.json', title: 'Import etter land', subtitle: 'NOK', type: 'line' },

    // === DFO STATSBUDSJETT ===
    { id: 'dfo-total-chart', url: './data/cached/dfo/total-government-expenditure.json', title: 'Totale statsutgifter', subtitle: 'NOK', type: 'line' },

    // === OLJEFONDET (SPU) ===
    { id: 'oil-fund-total-chart', url: './data/cached/oil-fund.json', title: 'Statens pensjonsfond utland - Total verdi', subtitle: 'Milliarder NOK', type: 'line' },

    // === STATNETT STRØMDATA ===
    { id: 'statnett-latest-detailed-overview-chart', url: './data/cached/statnett/latest-detailed-overview.json', title: 'Statnett Detaljert Oversikt', subtitle: 'Elektrisitetsproduksjon og forbruk', type: 'statnett-production-consumption' },

    // === VÅR VERDEN I DATA (OWID) CHARTS ===
    { id: 'norway-oda-per-capita-chart', url: './data/cached/oda_per_capita.json', title: 'Bistand per innbygger (ODA)', subtitle: 'USD per innbygger', type: 'line' },
    { id: 'norway-internet-usage-chart', url: './data/cached/internet_use.json', title: 'Internetbruk', subtitle: '% av befolkningen', type: 'line' },
    { id: 'norway-homicide-rate-chart', url: './data/cached/homicide_rate.json', title: 'Drapsrate', subtitle: 'per 100 000 innbyggere', type: 'line' },
    { id: 'norway-maternal-mortality-chart', url: './data/cached/maternal_mortality.json', title: 'Mødredødelighet', subtitle: 'dødsfall per 100 000 fødte', type: 'line' },
    { id: 'norway-military-spending-chart', url: './data/cached/military_spending.json', title: 'Militære utgifter', subtitle: '% av BNP', type: 'line' },
    { id: 'norway-women-parliament-chart', url: './data/cached/women_in_parliament.json', title: 'Kvinner i parlamentet', subtitle: '% av parlamentet', type: 'line' },
    { id: 'norway-co2-per-capita-chart', url: './data/cached/co2_per_capita.json', title: 'CO₂-utslipp per innbygger', subtitle: 'tonn per person', type: 'line' },
    { id: 'norway-vaccination-pol3-chart', url: './data/cached/vaccination_pol3.json', title: 'Vaksinasjonsdekning - Polio (Pol3)', subtitle: '% dekning', type: 'line' },
    { id: 'norway-child-mortality-chart', url: './data/cached/child_mortality.json', title: 'Barnedødelighet', subtitle: 'dødsfall per 100 fødte', type: 'line' },
    { id: 'norway-life-expectancy-chart', url: './data/cached/life_expectancy.json', title: 'Forventet levealder', subtitle: 'år', type: 'line' },
    { id: 'norway-employment-agriculture-chart', url: './data/cached/employment_in_agriculture_share.json', title: 'Sysselsetting i landbruk', subtitle: '% av arbeidsstyrken', type: 'line' },
    { id: 'norway-daily-calories-chart', url: './data/cached/daily_calories.json', title: 'Daglig kaloriinntak', subtitle: 'kilokalorier per dag', type: 'line' },
    { id: 'norway-median-age-chart', url: './data/cached/median_age.json', title: 'Medianalder', subtitle: 'år', type: 'line' },
    { id: 'norway-fertility-rate-chart', url: './data/cached/fertility_rate_period.json', title: 'Fruktbarhetsrate', subtitle: 'fødte barn per kvinne', type: 'line' },
    { id: 'norway-mean-income-per-day-chart', url: './data/cached/mean_income_per_day.json', title: 'Gjennomsnittlig inntekt per dag', subtitle: 'internasjonale dollar ($)', type: 'line' },
    { id: 'norway-armed-forces-personnel-chart', url: './data/cached/armed_forces_personnel.json', title: 'Militært personell', subtitle: 'personer', type: 'line' },
    { id: 'norway-alcohol-consumption-chart', url: './data/cached/alcohol_consumption_per_capita.json', title: 'Alkoholforbruk per innbygger', subtitle: 'liter ren alkohol per person (15+)', type: 'line' },
    { id: 'norway-trade-share-gdp-chart', url: './data/cached/trade_share_gdp.json', title: 'Handel som andel av BNP', subtitle: '% av BNP', type: 'line' },
    { id: 'norway-energy-use-per-capita-chart', url: './data/cached/energy_use_per_capita.json', title: 'Energibruk per innbygger', subtitle: 'kilowatttimer per person', type: 'line' },
    { id: 'norway-marriage-rate-chart', url: './data/cached/marriage_rate.json', title: 'Giftermålsrate', subtitle: 'per 1 000 innbyggere', type: 'line' },
    { id: 'norway-electric-car-sales-share-chart', url: './data/cached/electric_car_sales_share.json', title: 'Elbilandel av nybilsalg', subtitle: '% av nybilsalg', type: 'line' },
    { id: 'norway-no-education-share-chart', url: './data/cached/no_education_share.json', title: 'Andel uten utdanning', subtitle: '% av befolkningen (15-64 år)', type: 'line' },
    { id: 'norway-avg-years-schooling-chart', url: './data/cached/avg_years_schooling.json', title: 'Gjennomsnittlig skolegang', subtitle: 'år (alder 25+)', type: 'line' },
    { id: 'norway-pisa-science-chart', url: './data/cached/pisa_science.json', title: 'PISA Naturfag', subtitle: 'PISA-score', type: 'line' },
    { id: 'norway-pisa-reading-chart', url: './data/cached/pisa_reading.json', title: 'PISA Lesing', subtitle: 'PISA-score', type: 'line' },
    { id: 'norway-rnd-researchers-chart', url: './data/cached/rnd_researchers.json', title: 'FoU-forskere', subtitle: 'per million innbyggere', type: 'line' },
    { id: 'norway-tourist-trips-chart', url: './data/cached/tourist_trips.json', title: 'Turistbesøk', subtitle: 'internasjonale ankomster', type: 'line' },
];
