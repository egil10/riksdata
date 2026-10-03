# Test fixtures

Small recorded responses, one folder per source. The default test run is offline and reads only these files. Keep each file under 50 KB.

## ssb/

Responses from `https://data.ssb.no/api/pxwebapi/v2`, recorded on 2026-10-03. Narrow selections keep them small. The only edit is that `extension.contact` is removed, because it holds the names, phone numbers and e-mail addresses of SSB staff and the tests don't need it. To record them again, run this from `tests/fixtures/ssb/`:

```bash
UA="riksdata/0.1.0 (+https://riksdata.org; kontakt@riksdata.org)"
BASE="https://data.ssb.no/api/pxwebapi/v2"
get() { curl -sS -g -A "$UA" -o "$1" "$2"; sleep 2; }   # -g keeps the [] in valueCodes[...]

# Labour force survey: two contents, three months
get 13760_data_no.json "$BASE/tables/13760/data?lang=no&outputFormat=json-stat2&valueCodes[Kjonn]=0&valueCodes[Alder]=15-74&valueCodes[Justering]=S&valueCodes[ContentsCode]=Arbeidsstyrken,ArbledProsArbstyrk&valueCodes[Tid]=2026M06,2026M07,2026M08"
get 13760_metadata_en.json "$BASE/tables/13760/metadata?lang=en"

# Population: years with missing cells and status flags
get 05803_data_no.json "$BASE/tables/05803/data?lang=no&outputFormat=json-stat2&valueCodes[ContentsCode]=Personer,Skilsmisse,Innflyttinger&valueCodes[Tid]=1735,1736,2025,2026"
get 05803_metadata_en.json "$BASE/tables/05803/metadata?lang=en"

# Table info: an active table and a discontinued one
get table_13760_en.json "$BASE/tables/13760?lang=en"
get table_03013_en.json "$BASE/tables/03013?lang=en"

# Catalogue: two tables spread over two pages, in both languages
for lang in no en; do for page in 1 2; do
  curl -sS -G -A "$UA" -o "tables_${lang}_page${page}.json" "$BASE/tables" \
    --data-urlencode "lang=$lang" --data-urlencode "pageSize=1" --data-urlencode "pageNumber=$page" \
    --data-urlencode "includeDiscontinued=true" --data-urlencode "query=03013 OR 14710"
  sleep 2
done; done

# Drop SSB staff contact details from the data and metadata files
uv run python -c '
import json, pathlib
for path in pathlib.Path(".").glob("*.json"):
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data.get("extension"), dict) and data["extension"].pop("contact", None):
        path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
'
```

SSB revises figures, so a new recording can differ from the values the tests assert. Update the expected values in `tests/test_ssb.py` if that happens.

## owid/

Recorded from Our World in Data on 2026-10-03: three charts with their chart metadata and indicator metadata. The metadata files are unedited. The CSVs are trimmed to a few entities and years, and the indicator files have their `dimensions` key (a list of every entity and year) removed. To record them again, run this from the repository root:

```bash
cd tests/fixtures/owid
UA="riksdata/0.1.0 (+https://riksdata.org; kontakt@riksdata.org)"
Q="v=1&csvType=full&useColumnShortNames=true"
for slug in life-expectancy median-age gdp-per-capita-worldbank; do
  curl -sS -L --compressed -A "$UA" -o "$slug.metadata.json" "https://ourworldindata.org/grapher/$slug.metadata.json?$Q"; sleep 1
  curl -sS -L --compressed -A "$UA" -o "$slug.csv" "https://ourworldindata.org/grapher/$slug.csv?$Q"; sleep 1
done
# Indicator ids are the `owidVariableId` of each numeric column in the chart metadata.
for id in 1118466 950958 950961 1294305; do
  curl -sS -L --compressed -A "$UA" -o "indicator_$id.json" "https://api.ourworldindata.org/v1/indicators/$id.metadata.json"; sleep 1
done
cd ../../..

uv run python -c '
import csv, json, pathlib

folder = pathlib.Path("tests/fixtures/owid")
keep = {  # chart -> (entity codes, years)
    "life-expectancy": ({"NOR", "SWE", "FRA", "OWID_WRL"}, range(2019, 2024)),
    "median-age": ({"NOR", "OWID_WRL"}, range(2021, 2027)),
    "gdp-per-capita-worldbank": ({"NOR", "USA", "OWID_WRL"}, range(2022, 2026)),
}
for slug, (codes, years) in keep.items():
    path = folder / f"{slug}.csv"
    with path.open(encoding="utf-8", newline="") as handle:
        header, *rows = list(csv.reader(handle))
    rows = [row for row in rows if row[1] in codes and int(row[2]) in years]
    with path.open("w", encoding="utf-8", newline="") as handle:
        csv.writer(handle, lineterminator="\n").writerows([header, *rows])
for path in folder.glob("indicator_*.json"):
    data = json.loads(path.read_text(encoding="utf-8"))
    data.pop("dimensions", None)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
'
```

What each chart is for: `life-expectancy` is a plain one-column chart and includes France to test the entity filter. `median-age` has a second, projected column. `gdp-per-capita-worldbank` has the non-numeric `owid_region` column.
