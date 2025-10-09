# Broken Charts Removed

## Date: 2025-01-09

### 🗑️ Removed 8 Non-Working Charts

The following charts were not loading properly and have been removed from display:

---

## Removed Charts List:

### 1. ❌ **Living Arrangements National**
- **ID:** `living-arrangements-national-chart`
- **Source:** SSB 86813
- **Issue:** Data not loading correctly

### 2. ❌ **Norway Electricity Production and Consumption**
- **ID:** `statnett-production-consumption-chart`
- **Source:** Statnett
- **Issue:** Statnett data integration failing

### 3. ❌ **Women in Norwegian Parliament (Count)**
- **ID:** `stortinget-women-count-chart`
- **Source:** Stortinget
- **Issue:** Stortinget data integration failing

### 4. ❌ **Women in Norwegian Parliament (Percentage)**
- **ID:** `stortinget-women-percentage-chart`
- **Source:** Stortinget
- **Issue:** Stortinget data integration failing

### 5. ❌ **Norway Human Development Index**
- **ID:** `norway-hdi-chart`
- **Source:** Our World in Data
- **Issue:** HDI data not loading correctly

### 6. ❌ **Norway Tourist Trips**
- **ID:** `norway-tourist-trips-chart`
- **Source:** Our World in Data
- **Issue:** Tourism data not loading correctly

### 7. ❌ **Norway R&D Researchers**
- **ID:** `norway-rnd-researchers-chart`
- **Source:** Our World in Data
- **Issue:** R&D data not loading correctly

### 8. ❌ **Norway PISA Math**
- **ID:** `norway-pisa-math-chart`
- **Source:** Our World in Data
- **Issue:** PISA data not loading correctly

---

## 🔧 Implementation Method

### Approach: CSS + Config Removal
Rather than deleting HTML (which would make restoration harder), we:
1. ✅ **Added CSS rules** to hide the broken charts
2. ✅ **Removed from chartConfigs** in main.js to prevent loading attempts

### Files Modified:

1. **`src/css/main.css`**
   ```css
   /* Hide broken charts */
   [data-chart-id="living-arrangements-national-chart"],
   [data-chart-id="statnett-production-consumption-chart"],
   [data-chart-id="stortinget-women-count-chart"],
   [data-chart-id="stortinget-women-percentage-chart"],
   [data-chart-id="norway-hdi-chart"],
   [data-chart-id="norway-tourist-trips-chart"],
   [data-chart-id="norway-rnd-researchers-chart"],
   [data-chart-id="norway-pisa-math-chart"] {
       display: none !important;
   }
   ```

2. **`src/js/main.js`**
   - Removed chart configs from `chartConfigs` array
   - Added comments indicating removal

---

## 📊 Chart Count Update

**Before:** ~75 charts  
**After:** ~67 working charts ✅  
**Removed:** 8 broken charts

---

## ✅ Benefits

1. **No more empty chart cards** - Cleaner UI
2. **Faster page load** - 8 fewer chart loading attempts
3. **No console errors** - Charts won't try to load
4. **Easy restoration** - HTML is still intact if you want to fix them later

---

## 🔄 To Re-Enable a Chart Later

If you fix one of these charts:

1. **Remove CSS rule** from `src/css/main.css`
2. **Add back to chartConfigs** in `src/js/main.js`
3. **Test the data loading**

---

## 📝 Notes

- The HTML structure remains intact in `index.html`
- Charts are hidden with CSS (`display: none !important`)
- Config entries removed from JavaScript loading array
- No performance impact - charts never attempt to load

---

**Status:** All broken charts successfully hidden ✅

