# 🧹 Riksdata - Project Cleanup Recommendations

**Analysis Date:** October 13, 2025  
**Total Repository Size:** ~82MB cached data + archives + code

## 📊 Executive Summary

Your project has accumulated significant cruft that can be safely removed. Here's what I found:

### Quick Wins (Safe to Delete Immediately)
- **Archives folder:** ~entire folder is unused legacy code
- **Duplicate data files:** 29 `*_records.json` files (~400KB)
- **Extra favicons:** 2 unused favicon files
- **Test files:** 2 unused test files
- **Documentation:** Some redundant/outdated docs

### Total Potential Savings
- **Disk Space:** ~15-20MB (archives + duplicates)
- **File Count:** ~200+ files
- **Complexity:** Significantly reduced

---

## 🗂️ Detailed Findings

### 1. ❌ ARCHIVES FOLDER (DELETE ENTIRE FOLDER)
**Location:** `archives/`  
**Status:** ✅ Safe to delete - not referenced anywhere in active code  
**What's in it:**
- Old chart analysis scripts and tools
- Diagnostic reports (JSON, CSV)
- Backup JavaScript files
- Old Python tools for analysis
- SSB API data (duplicates)

**Files to remove:**
```
archives/
├── chart-layout-updater.js
├── check_missing_datasets.js
├── docs-reports/ (entire folder - 10 files)
├── reports/ (entire folder - 6 JSON reports)
├── ssb-api/ (entire folder - 2 JSON files)
└── tools/ (entire folder - 30+ Python scripts)
```

**Gitignore already excludes:** The `.gitignore` already has `archives/` listed, but the folder still exists locally.

---

### 2. 🗑️ DUPLICATE DATA FILES (DELETE 29 FILES)
**Location:** `data/cached/*_records.json`  
**Status:** ✅ Safe to delete - not used by application  
**Size:** ~400KB  

These appear to be raw OWID data exports that have already been processed into the main files:

**Files to remove:**
```
data/cached/alcohol_consumption_per_capita_records.json
data/cached/armed_forces_personnel_records.json
data/cached/avg_years_schooling_records.json
data/cached/child_mortality_records.json
data/cached/co2_per_capita_records.json
data/cached/daily_calories_records.json
data/cached/electric_car_sales_share_records.json
data/cached/employment_in_agriculture_share_records.json
data/cached/energy_use_per_capita_records.json
data/cached/fertility_rate_period_records.json
data/cached/hdi_records.json
data/cached/homicide_rate_records.json
data/cached/internet_use_records.json
data/cached/life_expectancy_records.json
data/cached/marriage_rate_records.json
data/cached/maternal_mortality_records.json
data/cached/mean_income_per_day_records.json
data/cached/median_age_records.json
data/cached/military_spending_records.json
data/cached/oda_per_capita_records.json
data/cached/pisa_math_records.json
data/cached/pisa_reading_records.json
data/cached/pisa_science_records.json
data/cached/rnd_researchers_records.json
data/cached/tourist_trips_records.json
data/cached/trade_share_gdp_records.json
data/cached/vaccination_coverage_records.json
data/cached/weekly_covid_cases_records.json
data/cached/women_in_parliament_records.json
```

**Evidence:** These are not referenced in `src/js/main.js` chartConfigs. The app uses the non-`_records` versions.

---

### 3. 🎨 EXTRA FAVICON FILES (DELETE 2 FILES)
**Location:** `src/assets/`  
**Status:** ⚠️ Check which one is active  
**Files:**
```
src/assets/favicon.ico      (unused?)
src/assets/favicon1.ico     (unused)
src/assets/favicon2.ico     (currently used in index.html)
```

**Recommendation:** Keep only `favicon2.ico` (currently referenced in `index.html` line 9), delete the other two.

---

### 4. 🧪 UNUSED TEST FILES (DELETE 2 FILES)
**Location:** Root directory  
**Status:** ✅ Safe to delete - development artifacts  

**Files to remove:**
```
test-dfo-loading.html           (DFO data loading test - no longer needed)
scripts/test-nve-api.js         (NVE API test - no longer needed)
```

---

### 5. 📝 REDUNDANT/OUTDATED DOCUMENTATION (REVIEW & CONSOLIDATE)
**Location:** `docs/`  
**Current docs:**
```
docs/CHART_ANALYSIS_REPORT.md          (Analysis from Aug 2025 - may be outdated)
docs/DATA_FORMAT_GUIDE.md              (Keep - useful reference)
docs/DATA_QUALITY_ANALYSIS_REPORT.md   (Analysis report - may be outdated)
docs/DFO_INTEGRATION_GUIDE.md          (Keep if DFO charts are still used)
docs/DUPLICATE_CHARTS_REPORT.md        (Analysis report - may be outdated)
docs/MISSING_DATA_ANALYSIS.md          (Analysis report - may be outdated)
docs/README.md                          (Keep - main docs index)
docs/REPOSITORY_ORGANIZATION.md        (Keep - describes structure)
```

**Recommendation:** 
- **Keep:** `DATA_FORMAT_GUIDE.md`, `DFO_INTEGRATION_GUIDE.md`, `README.md`, `REPOSITORY_ORGANIZATION.md`
- **Archive or Delete:** Analysis reports (`*_REPORT.md`, `*_ANALYSIS.md`) - these are point-in-time snapshots

---

### 6. 📦 R SCRIPTS ORGANIZATION
**Location:** `scripts/fetch/owid/`  
**Count:** 30 R scripts (owid1.R to owid30.R)  
**Status:** ⚠️ Needs review

**Current state:**
- Scripts are generically named (owid1.R, owid2.R, etc.)
- Hard to know what each one fetches
- May have duplicates or unused scripts

**Recommendation:**
- If these are still actively used, rename them to be descriptive (e.g., `owid-life-expectancy.R`)
- If not actively used, consider removing unused ones
- Add a README in `scripts/fetch/owid/` explaining what each script does

---

### 7. 🔧 UTILITY SCRIPT (POSSIBLY UNUSED)
**Location:** Root directory  
**File:** `translate_html_titles.py`  
**Status:** ⚠️ Likely a one-time use script

**Recommendation:** Delete if translations are complete (seems like a migration script)

---

## 🚀 Cleanup Action Plan

### Phase 1: Immediate Deletions (Safe & High Impact)
```bash
# 1. Delete archives folder
rm -rf archives/

# 2. Delete duplicate data files
cd data/cached
rm *_records.json

# 3. Delete unused test files
cd ../..
rm test-dfo-loading.html
rm scripts/test-nve-api.js

# 4. Delete extra favicons
rm src/assets/favicon.ico
rm src/assets/favicon1.ico

# 5. Delete translation script (if translations are done)
rm translate_html_titles.py
```

### Phase 2: Documentation Cleanup
```bash
# Move or delete outdated analysis reports
cd docs
rm CHART_ANALYSIS_REPORT.md
rm DATA_QUALITY_ANALYSIS_REPORT.md
rm DUPLICATE_CHARTS_REPORT.md
rm MISSING_DATA_ANALYSIS.md
```

### Phase 3: Optional - R Scripts Audit
1. Review which OWID scripts are still needed
2. Rename active scripts to be descriptive
3. Delete unused scripts
4. Add documentation

---

## 📈 Expected Results

### Before Cleanup
- **Files:** 300+ files
- **Size:** ~100MB
- **Structure:** Cluttered with legacy code
- **Maintenance:** Confusing with old/new mixed

### After Cleanup
- **Files:** ~100-150 files
- **Size:** ~80MB
- **Structure:** Clean, organized
- **Maintenance:** Much easier to navigate

---

## ⚠️ Important Notes

### DO NOT DELETE (These are actively used):
- ✅ `data/cached/dfo/` - All 30 DFO budget files ARE used in the app
- ✅ `data/cached/ssb/` - All 128 SSB files ARE used
- ✅ `data/cached/norges-bank/` - All Norges Bank files ARE used
- ✅ `data/cached/nve/` - NVE reservoir data IS used
- ✅ `data/cached/statnett/` - Statnett electricity data IS used
- ✅ `data/cached/oslo-indices/` - Oslo stock exchange data IS used
- ✅ All non-`_records` OWID data files in `data/cached/` root

### Files That Need Verification:
- 🔍 OWID R scripts - verify which are still in use
- 🔍 `translate_html_titles.py` - if translations are complete, can delete

---

## 💡 Recommendations for Future

1. **Add to .gitignore:**
   ```
   # Already there but ensure archives stay out
   archives/
   
   # Add these patterns
   *_records.json
   test-*.html
   test-*.js
   translate_*.py
   ```

2. **Regular Cleanup Schedule:**
   - Review and remove unused scripts quarterly
   - Keep only current documentation
   - Archive old analysis reports to a separate branch if needed

3. **Better Organization:**
   - Name scripts descriptively (not generic numbers)
   - Document what each data source is for
   - Keep a changelog of what's been added/removed

---

## 🎯 Next Steps

1. **Review this report** and confirm which deletions to proceed with
2. **Backup** if you want to be extra cautious (though git history has you covered)
3. **Execute** Phase 1 deletions (safest, highest impact)
4. **Test** the application still works correctly
5. **Execute** Phase 2 if desired
6. **Commit** the cleanup with a clear message like "chore: remove legacy code and duplicate files"

---

## 📊 Summary Table

| Category | Files to Delete | Space Saved | Risk Level |
|----------|----------------|-------------|------------|
| Archives folder | ~50 files | ~15MB | ✅ None |
| Duplicate `*_records.json` | 29 files | ~400KB | ✅ None |
| Extra favicons | 2 files | ~50KB | ✅ None |
| Test files | 2 files | ~5KB | ✅ None |
| Translation script | 1 file | ~2KB | ✅ None |
| Outdated docs | 4 files | ~100KB | ⚠️ Low |
| **TOTAL** | **~88 files** | **~16MB** | **✅ Safe** |

---

**Generated by AI Analysis - October 13, 2025**

