// ============================================================================
// DRILL-DOWN CHART CONFIGURATIONS
// ============================================================================
// These charts are loaded on-demand when navigating to specific views
// Access via URL hash: index.html#bankruptcies, index.html#exports, etc.

export const drilldownConfigs = {
    // === POLITISK TIDSLINJE (Norske regjeringer 1965-2025) ===
    politicalTimeline: [
        { id: 'political-timeline-data', url: './data/static/political-timeline.json', title: 'Norsk politisk tidslinje', subtitle: 'Statsministre og regjeringer 1965-2025', type: 'timeline' }
    ],

    // === BEFOLKNING (Detaljert befolkningsanalyse) ===
    population: [
        { id: 'population-basic-districts-national-drilldown', url: './data/cached/ssb/population-basic-districts-national.json', title: 'Befolkning etter distrikt', subtitle: 'Personer', type: 'line' },
        { id: 'population-by-gender-age-historical-drilldown', url: './data/cached/ssb/population-by-gender-age-historical.json', title: 'Befolkning etter kjønn og alder (Historisk)', subtitle: 'Personer', type: 'line' },
        { id: 'population-by-gender-age-5year-drilldown', url: './data/cached/ssb/population-by-gender-age-5year.json', title: 'Befolkning etter kjønn og alder (5-årsgrupper)', subtitle: 'Personer', type: 'line' },
        { id: 'population-growth-alt-drilldown', url: './data/cached/ssb/population-growth-alt.json', title: 'Befolkningsvekst (Kvartalsvis)', subtitle: 'Personer', type: 'line' },
        { id: 'immigration-rate-drilldown', url: 'https://data.ssb.no/api/v0/dataset/48651.json?lang=no', title: 'Innvandringsrate', subtitle: 'Årlig antall', type: 'line' },
        { id: 'immigrants-with-immigrant-parents-drilldown', url: 'https://data.ssb.no/api/v0/dataset/96304.json?lang=no', title: 'Innvandrere med innvandrerforeldre', subtitle: 'Antall', type: 'line' },
        { id: 'births-deaths-drilldown', url: 'https://data.ssb.no/api/v0/dataset/1106.json?lang=no', title: 'Fødsler og dødsfall', subtitle: 'Antall', type: 'line' },
        { id: 'deaths-age-drilldown', url: 'https://data.ssb.no/api/v0/dataset/567324.json?lang=no', title: 'Dødsfall etter alder', subtitle: 'Antall', type: 'line' },
        { id: 'deaths-by-week-age-drilldown', url: 'https://data.ssb.no/api/v0/dataset/567324.json?lang=no', title: 'Dødsfall per uke og alder', subtitle: 'Antall', type: 'line' }
    ],

    // === KONKURSER ETTER NÆRING ===
    bankruptcies: [
        { id: 'bankruptcies-total-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-total.json', title: 'Totalt (Alle næringer)', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-01-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-01-crop-and-animal-production-hunting-and-related-service-activities.json', title: 'Jordbruk og jakt', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-03-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-03-fishing-and-aquaculture.json', title: 'Fiske og akvakultur', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-06-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-06-extraction-of-crude-petroleum-and-natural-gas.json', title: 'Utvinning av olje og gass', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-09-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-09-mining-support-service-activities.json', title: 'Støttetjenester for utvinning', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-10-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-10-manufacture-of-food-products.json', title: 'Matvareproduksjon', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-31-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-31-manufacture-of-furniture.json', title: 'Møbelproduksjon', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-41-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-41-construction-of-buildings.json', title: 'Oppføring av bygninger', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-42-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-42-civil-engineering.json', title: 'Anleggsarbeid', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-43-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-43-specialised-construction-activities.json', title: 'Spesialisert byggevirksomhet', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-45-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-45-wholesale-and-retail-trade-and-repair-of-motor-vehicles-and-motorcycles.json', title: 'Bilsalg og reparasjon', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-46-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-46-wholesale-trade-except-of-motor-vehicles-and-motorcycles.json', title: 'Engroshandel', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-47-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-47-retail-trade-except-of-motor-vehicles-and-motorcycles.json', title: 'Detaljhandel', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-49-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-49-land-transport-and-transport-via-pipelines.json', title: 'Landtransport', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-50-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-50-water-transport.json', title: 'Sjøfart og sjøtransport', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-55-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-55-accommodation.json', title: 'Overnatting (Hotell)', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-56-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-56-food-and-beverage-service-activities.json', title: 'Serveringsvirksomhet', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-62-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-62-computer-programming.json', title: 'IT-programmering', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-68-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-68-real-estate-activities.json', title: 'Eiendomsomsetning', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-69-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-69-legal-and-accounting-activities.json', title: 'Juridisk og regnskapsmessig tjenesteyting', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-71-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-71-architectural-and-engineering-activities.json', title: 'Arkitekt- og ingeniørvirksomhet', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-73-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-73-advertising-and-market-research.json', title: 'Reklame og markedføring', subtitle: 'Antall per kvartal', type: 'line' },
        { id: 'bankruptcies-85-drilldown', url: './data/cached/ssb/bankruptcies-by-industry/bankruptcies-85-education.json', title: 'Undervisning', subtitle: 'Antall per kvartal', type: 'line' },
    ],

    // === KREDITTINDIKATORER ===
    creditIndicator: [
        { id: 'credit-indicator-main-drilldown', url: 'https://data.ssb.no/api/v0/dataset/166326.json?lang=no', title: 'Kredittindikator - Hovedtall', subtitle: 'Millioner NOK', type: 'line' },
        { id: 'credit-indicator-k2-detailed-drilldown', url: 'https://data.ssb.no/api/v0/dataset/62264.json?lang=no', title: 'Kredittindikator - K2 Detaljert', subtitle: 'Millioner NOK', type: 'line' },
        { id: 'credit-indicator-k2-seasonally-adjusted-drilldown', url: 'https://data.ssb.no/api/v0/dataset/166329.json?lang=no', title: 'Kredittindikator - K2 Sesongjustert', subtitle: 'Millioner NOK', type: 'line' },
        { id: 'credit-indicator-k3-drilldown', url: 'https://data.ssb.no/api/v0/dataset/166327.json?lang=no', title: 'Kredittindikator - K3', subtitle: 'Millioner NOK', type: 'line' },
    ],

    // === PRODUSENTPRISINDEKS (PPI) ===
    ppi: [
        { id: 'ppi-total-all-markets-drilldown', url: './data/cached/ssb/ppi/ppi-snn0-domestic-and-export-market-total.json', title: 'PPI - Totalt (Alle markeder)', subtitle: 'Indeks', type: 'line' },
        { id: 'ppi-total-domestic-drilldown', url: './data/cached/ssb/ppi/ppi-snn0-domestic-market.json', title: 'PPI - Totalt (Hjemmemarked)', subtitle: 'Indeks', type: 'line' },
        { id: 'ppi-total-export-drilldown', url: './data/cached/ssb/ppi/ppi-snn0-export-market.json', title: 'PPI - Totalt (Eksportmarked)', subtitle: 'Indeks', type: 'line' },
        { id: 'ppi-oil-gas-all-drilldown', url: './data/cached/ssb/ppi/ppi-snn06_tot-domestic-and-export-market-total.json', title: 'PPI - Olje og gass (Alle markeder)', subtitle: 'Indeks', type: 'line' },
        { id: 'ppi-oil-gas-domestic-drilldown', url: './data/cached/ssb/ppi/ppi-snn06_tot-domestic-market.json', title: 'PPI - Olje og gass (Hjemme)', subtitle: 'Indeks', type: 'line' },
        { id: 'ppi-oil-gas-export-drilldown', url: './data/cached/ssb/ppi/ppi-snn06_tot-export-market.json', title: 'PPI - Olje og gass (Eksport)', subtitle: 'Indeks', type: 'line' },
        { id: 'ppi-manufacturing-all-drilldown', url: './data/cached/ssb/ppi/ppi-snn10_33-domestic-and-export-market-total.json', title: 'PPI - Industri (Alle markeder)', subtitle: 'Indeks', type: 'line' },
        { id: 'ppi-manufacturing-domestic-drilldown', url: './data/cached/ssb/ppi/ppi-snn10_33-domestic-market.json', title: 'PPI - Industri (Hjemme)', subtitle: 'Indeks', type: 'line' },
        { id: 'ppi-manufacturing-export-drilldown', url: './data/cached/ssb/ppi/ppi-snn10_33-export-market.json', title: 'PPI - Industri (Eksport)', subtitle: 'Indeks', type: 'line' },
        { id: 'ppi-electricity-all-drilldown', url: './data/cached/ssb/ppi/ppi-snn35_tot-domestic-and-export-market-total.json', title: 'PPI - Strøm og gass (Alle markeder)', subtitle: 'Indeks', type: 'line' },
        { id: 'ppi-excl-energy-all-drilldown', url: './data/cached/ssb/ppi/ppi-spe4-domestic-and-export-market-total.json', title: 'PPI - Ekskludert energi (Alle markeder)', subtitle: 'Indeks', type: 'line' },
        { id: 'ppi-energy-goods-all-drilldown', url: './data/cached/ssb/ppi/ppi-e6_tot-domestic-and-export-market-total.json', title: 'PPI - Energivarer (Alle markeder)', subtitle: 'Indeks', type: 'line' },
        { id: 'ppi-food-manufacturing-drilldown', url: './data/cached/ssb/ppi/ppi-snn10-domestic-and-export-market-total.json', title: 'PPI - Matvareindustri', subtitle: 'Indeks', type: 'line' },
        { id: 'ppi-wood-manufacturing-drilldown', url: './data/cached/ssb/ppi/ppi-snn16-domestic-and-export-market-total.json', title: 'PPI - Trevareindustri', subtitle: 'Indeks', type: 'line' },
        { id: 'ppi-chemical-manufacturing-drilldown', url: './data/cached/ssb/ppi/ppi-snn20-domestic-and-export-market-total.json', title: 'PPI - Kjemisk industri', subtitle: 'Indeks', type: 'line' },
        { id: 'ppi-metal-manufacturing-drilldown', url: './data/cached/ssb/ppi/ppi-snn24-domestic-and-export-market-total.json', title: 'PPI - Metallindustri', subtitle: 'Indeks', type: 'line' }
    ],

    // === KPI (Konsumprisindeks) ===
    cpi: [
        { id: 'cpi-main-drilldown', url: './data/cached/ssb/cpi.json', title: 'KPI - Totalindeks', subtitle: 'Indeks (2015=100)', type: 'line' },
        { id: 'cpi-ate-drilldown', url: './data/cached/ssb/cpi-ate.json', title: 'KPI-JAE (Justert for avgift og energi)', subtitle: 'Indeks', type: 'line' },
        { id: 'cpi-seasonally-adjusted-drilldown', url: './data/cached/ssb/cpi-seasonally-adjusted.json', title: 'KPI - Sesongjustert', subtitle: 'Indeks', type: 'line' },
        { id: 'cpi-seasonally-adjusted-recent-drilldown', url: './data/cached/ssb/cpi-seasonally-adjusted-recent.json', title: 'KPI - Sesongjustert (Siste data)', subtitle: 'Indeks', type: 'line' },
        { id: 'cpi-total-index-recent-drilldown', url: './data/cached/ssb/cpi-total-index-recent.json', title: 'KPI - Totalindeks (Siste data)', subtitle: 'Indeks', type: 'line' },
        { id: 'cpi-subgroups-drilldown', url: './data/cached/ssb/cpi-subgroups.json', title: 'KPI - Etter undergrupper', subtitle: 'Indeks', type: 'line' },
        { id: 'cpi-subgroup-level2-drilldown', url: './data/cached/ssb/cpi-subgroup-level2.json', title: 'KPI - Etter undergrupper nivå 2', subtitle: 'Indeks', type: 'line' },
        { id: 'cpi-group-level-drilldown', url: './data/cached/ssb/cpi-group-level.json', title: 'KPI - Etter gruppenivå', subtitle: 'Indeks', type: 'line' },
        { id: 'cpi-coicop-drilldown', url: './data/cached/ssb/cpi-coicop.json', title: 'KPI - Etter COICOP-klassifisering', subtitle: 'Indeks', type: 'line' },
        { id: 'cpi-items-drilldown', url: './data/cached/ssb/cpi-items.json', title: 'KPI - Etter enkeltvarer', subtitle: 'Indeks', type: 'line' },
        { id: 'cpi-weights-subgroup-drilldown', url: './data/cached/ssb/cpi-weights-subgroup.json', title: 'KPI - Vekter etter undergruppe', subtitle: 'Vekt', type: 'line' },
        { id: 'cpi-delivery-drilldown', url: './data/cached/ssb/cpi-delivery.json', title: 'KPI - Etter leveringssektor', subtitle: 'Indeks', type: 'line' },
        { id: 'cpi-delivery-sector-annual-drilldown', url: './data/cached/ssb/cpi-delivery-sector-annual.json', title: 'KPI - Leveringssektor (Årlig)', subtitle: 'Indeks', type: 'line' },
        { id: 'cpi-delivery-sector-recent-drilldown', url: './data/cached/ssb/cpi-delivery-sector-recent.json', title: 'KPI - Leveringssektor (Siste data)', subtitle: 'Indeks', type: 'line' },
        { id: 'cpi-adjusted-indices-drilldown', url: './data/cached/ssb/cpi-adjusted-indices.json', title: 'KPI-JA - Justerte indekser', subtitle: 'Indeks', type: 'line' },
        { id: 'cpi-adjusted-delivery-sector-drilldown', url: './data/cached/ssb/cpi-adjusted-delivery-sector.json', title: 'KPI-JA - Justert leveringssektor', subtitle: 'Indeks', type: 'line' },
        { id: 'cpi-adjusted-delivery-sector-recent-drilldown', url: './data/cached/ssb/cpi-adjusted-delivery-sector-recent.json', title: 'KPI-JA - Justert leveringssektor (Siste data)', subtitle: 'Indeks', type: 'line' },
    ],

    // === IMPORT ETTER LAND ===
    imports: [
        { id: 'import-se-drilldown', url: './data/cached/ssb/import-by-country/import-se.json', title: 'Sverige', subtitle: 'NOK', type: 'line' },
        { id: 'import-de-drilldown', url: './data/cached/ssb/import-by-country/import-de.json', title: 'Tyskland', subtitle: 'NOK', type: 'line' },
        { id: 'import-cn-drilldown', url: './data/cached/ssb/import-by-country/import-cn.json', title: 'Kina', subtitle: 'NOK', type: 'line' },
        { id: 'import-us-drilldown', url: './data/cached/ssb/import-by-country/import-us.json', title: 'USA', subtitle: 'NOK', type: 'line' },
        { id: 'import-dk-drilldown', url: './data/cached/ssb/import-by-country/import-dk.json', title: 'Danmark', subtitle: 'NOK', type: 'line' },
        { id: 'import-gb-drilldown', url: './data/cached/ssb/import-by-country/import-gb.json', title: 'Storbritannia', subtitle: 'NOK', type: 'line' },
        { id: 'import-nl-drilldown', url: './data/cached/ssb/import-by-country/import-nl.json', title: 'Nederland', subtitle: 'NOK', type: 'line' },
        { id: 'import-fr-drilldown', url: './data/cached/ssb/import-by-country/import-fr.json', title: 'Frankrike', subtitle: 'NOK', type: 'line' },
        { id: 'import-it-drilldown', url: './data/cached/ssb/import-by-country/import-it.json', title: 'Italia', subtitle: 'NOK', type: 'line' },
        { id: 'import-pl-drilldown', url: './data/cached/ssb/import-by-country/import-pl.json', title: 'Polen', subtitle: 'NOK', type: 'line' },
        { id: 'import-fi-drilldown', url: './data/cached/ssb/import-by-country/import-fi.json', title: 'Finland', subtitle: 'NOK', type: 'line' },
        { id: 'import-be-drilldown', url: './data/cached/ssb/import-by-country/import-be.json', title: 'Belgia', subtitle: 'NOK', type: 'line' },
        { id: 'import-jp-drilldown', url: './data/cached/ssb/import-by-country/import-jp.json', title: 'Japan', subtitle: 'NOK', type: 'line' },
        { id: 'import-kr-drilldown', url: './data/cached/ssb/import-by-country/import-kr.json', title: 'Sør-Korea', subtitle: 'NOK', type: 'line' },
        { id: 'import-es-drilldown', url: './data/cached/ssb/import-by-country/import-es.json', title: 'Spania', subtitle: 'NOK', type: 'line' },
    ],

    // === EKSPLISITTE STATSBUDSJETT (DFO) ===
    dfo: [
        { id: 'dfo-arbeids-expenditure-drilldown', url: './data/cached/dfo/arbeids-og-inkluderingsdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Arbeids- og inkluderingsdepartementet - Utgifter', subtitle: 'NOK', type: 'line' },
        { id: 'dfo-arbeids-revenue-drilldown', url: './data/cached/dfo/arbeids-og-inkluderingsdepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Arbeids- og inkluderingsdepartementet - Inntekter', subtitle: 'NOK', type: 'line' },
        { id: 'dfo-barne-expenditure-drilldown', url: './data/cached/dfo/barne-og-familiedepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Barne- og familiedepartementet - Utgifter', subtitle: 'NOK', type: 'line' },
        { id: 'dfo-barne-revenue-drilldown', url: './data/cached/dfo/barne-og-familiedepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Barne- og familiedepartementet - Inntekter', subtitle: 'NOK', type: 'line' },
        { id: 'dfo-energi-expenditure-drilldown', url: './data/cached/dfo/energidepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Energidepartementet - Utgifter', subtitle: 'NOK', type: 'line' },
        { id: 'dfo-energi-revenue-drilldown', url: './data/cached/dfo/energidepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Energidepartementet - Inntekter', subtitle: 'NOK', type: 'line' },
        { id: 'dfo-finans-expenditure-drilldown', url: './data/cached/dfo/finansdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Finansdepartementet - Utgifter', subtitle: 'NOK', type: 'line' },
        { id: 'dfo-finans-revenue-drilldown', url: './data/cached/dfo/finansdepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Finansdepartementet - Inntekter', subtitle: 'NOK', type: 'line' },
        { id: 'dfo-forsvar-expenditure-drilldown', url: './data/cached/dfo/forsvarsdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Forsvarsdepartementet - Utgifter', subtitle: 'NOK', type: 'line' },
        { id: 'dfo-forsvar-revenue-drilldown', url: './data/cached/dfo/forsvarsdepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Forsvarsdepartementet - Inntekter', subtitle: 'NOK', type: 'line' },
        { id: 'dfo-helse-expenditure-drilldown', url: './data/cached/dfo/helse-og-omsorgsdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Helse- og omsorgsdepartementet - Utgifter', subtitle: 'NOK', type: 'line' },
        { id: 'dfo-helse-revenue-drilldown', url: './data/cached/dfo/helse-og-omsorgsdepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Helse- og omsorgsdepartementet - Inntekter', subtitle: 'NOK', type: 'line' },
        { id: 'dfo-justis-expenditure-drilldown', url: './data/cached/dfo/justis-og-beredskapsdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Justis- og beredskapsdepartementet - Utgifter', subtitle: 'NOK', type: 'line' },
        { id: 'dfo-justis-revenue-drilldown', url: './data/cached/dfo/justis-og-beredskapsdepartementet-revenue-20142015201620172018201920202021202220232024.json', title: 'Justis- og beredskapsdepartementet - Inntekter', subtitle: 'NOK', type: 'line' },
        { id: 'dfo-kunnskap-expenditure-drilldown', url: './data/cached/dfo/kunnskapsdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Kunnskapsdepartementet - Utgifter', subtitle: 'NOK', type: 'line' },
        { id: 'dfo-naering-expenditure-drilldown', url: './data/cached/dfo/n-rings-og-fiskeridepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Nærings- og fiskeridepartementet - Utgifter', subtitle: 'NOK', type: 'line' },
        { id: 'dfo-samferdsel-expenditure-drilldown', url: './data/cached/dfo/samferdselsdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Samferdselsdepartementet - Utgifter', subtitle: 'NOK', type: 'line' },
        { id: 'dfo-utenriks-expenditure-drilldown', url: './data/cached/dfo/utenriksdepartementet-expenditure-20142015201620172018201920202021202220232024.json', title: 'Utenriksdepartementet - Utgifter', subtitle: 'NOK', type: 'line' },
    ],

    // === OLJEFONDET (SPU) FORDELING ===
    oilfund: [
        { id: 'oil-fund-total-drilldown', url: './data/cached/oil-fund.json', title: 'Oljefondet - Total markedsverdi', subtitle: 'Milliarder NOK', type: 'line' },
        { id: 'oil-fund-equities-drilldown', url: './data/cached/oil-fund-equities.json', title: 'Aksjer', subtitle: 'Milliarder NOK', type: 'line' },
        { id: 'oil-fund-fixed-income-drilldown', url: './data/cached/oil-fund-fixed-income.json', title: 'Rentepapirer', subtitle: 'Milliarder NOK', type: 'line' },
        { id: 'oil-fund-real-estate-drilldown', url: './data/cached/oil-fund-real-estate.json', title: 'Eiendom', subtitle: 'Milliarder NOK', type: 'line' },
        { id: 'oil-fund-renewable-drilldown', url: './data/cached/oil-fund-renewable-infrastructure.json', title: 'Fornybar infrastruktur', subtitle: 'Milliarder NOK', type: 'line' },
    ],

    // === VAKSINASJONSDEKNING ===
    vaccinations: [
        { id: 'vaccination-hib3-drilldown', url: './data/cached/vaccination_hib3.json', title: 'Hib3 (Haemophilus influenzae type b)', subtitle: 'Dekning %', type: 'line' },
        { id: 'vaccination-dtpcv3-drilldown', url: './data/cached/vaccination_dtpcv3.json', title: 'DTP-vaksine (3. dose)', subtitle: 'Dekning %', type: 'line' },
        { id: 'vaccination-hepb3-drilldown', url: './data/cached/vaccination_hepb3.json', title: 'HepB3 (Hepatitt B)', subtitle: 'Dekning %', type: 'line' },
        { id: 'vaccination-ipv1-drilldown', url: './data/cached/vaccination_ipv1.json', title: 'IPV1 (Polio vaksine)', subtitle: 'Dekning %', type: 'line' },
        { id: 'vaccination-mcv1-drilldown', url: './data/cached/vaccination_mcv1.json', title: 'MCV1 (Meslinger)', subtitle: 'Dekning %', type: 'line' },
        { id: 'vaccination-pcv3-drilldown', url: './data/cached/vaccination_pcv3.json', title: 'PCV3 (Pneumokokkar)', subtitle: 'Dekning %', type: 'line' },
        { id: 'vaccination-pol3-drilldown', url: './data/cached/vaccination_pol3.json', title: 'Pol3 (Polio)', subtitle: 'Dekning %', type: 'line' },
        { id: 'vaccination-rcv1-drilldown', url: './data/cached/vaccination_rcv1.json', title: 'RCV1 (Røde hunder)', subtitle: 'Dekning %', type: 'line' },
        { id: 'vaccination-rotac-drilldown', url: './data/cached/vaccination_rotac.json', title: 'RotaC (Rotavirus)', subtitle: 'Dekning %', type: 'line' },
    ],

    // === EKSPORT ETTER LAND ===
    exports: [
        { id: 'export-de-drilldown', url: './data/cached/ssb/export-by-country/export-de.json', title: 'Tyskland', subtitle: 'NOK', type: 'line' },
        { id: 'export-gb-drilldown', url: './data/cached/ssb/export-by-country/export-gb.json', title: 'Storbritannia', subtitle: 'NOK', type: 'line' },
        { id: 'export-nl-drilldown', url: './data/cached/ssb/export-by-country/export-nl.json', title: 'Nederland', subtitle: 'NOK', type: 'line' },
        { id: 'export-us-drilldown', url: './data/cached/ssb/export-by-country/export-us.json', title: 'USA', subtitle: 'NOK', type: 'line' },
        { id: 'export-se-drilldown', url: './data/cached/ssb/export-by-country/export-se.json', title: 'Sverige', subtitle: 'NOK', type: 'line' },
        { id: 'export-fr-drilldown', url: './data/cached/ssb/export-by-country/export-fr.json', title: 'Frankrike', subtitle: 'NOK', type: 'line' },
        { id: 'export-dk-drilldown', url: './data/cached/ssb/export-by-country/export-dk.json', title: 'Danmark', subtitle: 'NOK', type: 'line' },
        { id: 'export-cn-drilldown', url: './data/cached/ssb/export-by-country/export-cn.json', title: 'Kina', subtitle: 'NOK', type: 'line' },
        { id: 'export-be-drilldown', url: './data/cached/ssb/export-by-country/export-be.json', title: 'Belgia', subtitle: 'NOK', type: 'line' },
        { id: 'export-it-drilldown', url: './data/cached/ssb/export-by-country/export-it.json', title: 'Italia', subtitle: 'NOK', type: 'line' },
    ],

    // === LØNNSINDEKS (Fordelt på næring) ===
    wages: [
        { id: 'wage-basic-all-industries-drilldown', url: './data/cached/ssb/wages/wage-wagebasicmonthlyindex-00_99-ialt.json', title: 'Lønnsindeks - Grunnlønn (Alle næringer)', subtitle: 'Indeks', type: 'line' },
        { id: 'wage-total-all-industries-drilldown', url: './data/cached/ssb/wages/wage-wagemdtotalindex-00_99-ialt.json', title: 'Lønnsindeks - Total lønn (Alle næringer)', subtitle: 'Indeks', type: 'line' },
        { id: 'wage-manufacturing-basic-drilldown', url: './data/cached/ssb/wages/wage-wagebasicmonthlyindex-10_33-ialt.json', title: 'Lønnsindeks - Industri (Grunnlønn)', subtitle: 'Indeks', type: 'line' },
        { id: 'wage-construction-basic-drilldown', url: './data/cached/ssb/wages/wage-wagebasicmonthlyindex-41_43-ialt.json', title: 'Lønnsindeks - Byggevirksomhet (Grunnlønn)', subtitle: 'Indeks', type: 'line' },
        { id: 'wage-financial-basic-drilldown', url: './data/cached/ssb/wages/wage-wagebasicmonthlyindex-64_66-ialt.json', title: 'Lønnsindeks - Finans og forsikring (Grunnlønn)', subtitle: 'Indeks', type: 'line' },
        { id: 'wage-public-admin-basic-drilldown', url: './data/cached/ssb/wages/wage-wagebasicmonthlyindex-84-ialt.json', title: 'Lønnsindeks - Offentlig forvaltning (Grunnlønn)', subtitle: 'Indeks', type: 'line' },
        { id: 'wage-education-basic-drilldown', url: './data/cached/ssb/wages/wage-wagebasicmonthlyindex-85-ialt.json', title: 'Lønnsindeks - Undervisning (Grunnlønn)', subtitle: 'Indeks', type: 'line' },
        { id: 'wage-health-basic-drilldown', url: './data/cached/ssb/wages/wage-wagebasicmonthlyindex-86_88-ialt.json', title: 'Lønnsindeks - Helse- og sosialtjenester (Grunnlønn)', subtitle: 'Indeks', type: 'line' },
    ],

    // === VALUTAKURSER (Norges Bank) ===
    exchangeRates: [
        { id: 'i44-nok-drilldown', url: './data/cached/norges-bank/exchange-rates/i44.json', title: 'I44/NOK', subtitle: 'Indeks', type: 'line' },
        { id: 'usd-nok-drilldown', url: './data/cached/norges-bank/exchange-rates/usd.json', title: 'USD/NOK', subtitle: 'NOK per USD', type: 'line' },
        { id: 'eur-nok-drilldown', url: './data/cached/norges-bank/exchange-rates/eur.json', title: 'EUR/NOK', subtitle: 'NOK per EUR', type: 'line' },
        { id: 'gbp-nok-drilldown', url: './data/cached/norges-bank/exchange-rates/gbp.json', title: 'GBP/NOK', subtitle: 'NOK per GBP', type: 'line' },
        { id: 'sek-nok-drilldown', url: './data/cached/norges-bank/exchange-rates/sek.json', title: 'SEK/NOK', subtitle: 'NOK per 100 SEK', type: 'line' },
    ],

    // === PENGEMENGDE (SSB) ===
    moneySupply: [
        { id: 'money-supply-m0-drilldown', url: './data/cached/ssb/money-supply-m0.json', title: 'Pengemengde M0', subtitle: 'Millioner NOK', type: 'line' },
        { id: 'money-supply-by-sector-drilldown', url: './data/cached/ssb/money-supply-by-sector.json', title: 'Pengemengde etter sektor', subtitle: 'Millioner NOK', type: 'line' },
    ],

    // === OSLO BØRS INDEKSER ===
    osloIndices: [
        { id: 'oseax-drilldown', url: './data/cached/oslo-indices/oseax.json', title: 'OSEAX Hovedindeks', subtitle: 'Indeksverdi', type: 'line' },
        { id: 'osebx-drilldown', url: './data/cached/oslo-indices/osebx.json', title: 'OSEBX Benchmark-indeks', subtitle: 'Indeksverdi', type: 'line' },
        { id: 'obx-drilldown', url: './data/cached/oslo-indices/obx.json', title: 'OBX 25 Liquid-indeks', subtitle: 'Indeksverdi', type: 'line' }
    ],

};
