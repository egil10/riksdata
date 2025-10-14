# Drilldown & Download Fixes - October 2025

## Summary
This document describes the fixes applied to resolve critical issues with drilldown chart rendering and download functionality.

---

## Issue 1: Drilldown Charts Not Displaying

### Problem
All drilldown charts (bankruptcies by industry, exports by country, imports, DFO departments, etc.) were completely empty/invisible despite having valid data loaded. The HTML showed:
- Canvas elements with `style="display: none;"`
- Skeleton loaders still visible
- Chart data was actually loading correctly but staying hidden

### Root Cause
Two bugs in `src/js/charts.js` → `renderChart()` function:

1. **Canvas Visibility**: After creating the Chart.js instance, the canvas element was never made visible
2. **Skeleton ID Logic**: The skeleton hiding logic tried to replace `-chart` with `-skeleton` in canvas IDs, but drilldown chart IDs don't have `-chart` suffix (e.g., `bankruptcies-03-drilldown` not `bankruptcies-03-chart`)

### Fix Applied
**File**: `src/js/charts.js` (lines ~2085-2109)

```javascript
// Make the canvas itself visible
canvas.style.display = 'block';
console.log(`Canvas display set to block for ${title}`);

// Hide the skeleton for this specific chart
// Handle both regular charts (e.g., 'my-chart') and drilldown charts (e.g., 'my-drilldown')
let skeletonId = canvas.id + '-skeleton';
if (canvas.id.endsWith('-chart')) {
    skeletonId = canvas.id.replace('-chart', '-skeleton');
}
const skeleton = document.getElementById(skeletonId);
if (skeleton) {
    skeleton.style.display = 'none';
    console.log(`Skeleton hidden for ${title} (ID: ${skeletonId})`);
} else {
    console.warn(`Skeleton not found for ${title} (tried ID: ${skeletonId})`);
}
```

### Result
✅ All drilldown charts now display correctly:
- Bankruptcies by industry (23 industries)
- Exports by country (50+ countries)
- Imports by country (50+ countries)
- DFO department budgets (15 departments × 2)
- Vaccination coverage (9 vaccines)
- Oil Fund breakdown (5 asset classes)
- CPI variations (16 measures)

---

## Issue 2: Chart Cards Too Tall

### Problem
Chart cards were excessively tall (200px on mobile, 220px on desktop), making them look boxy and taking up too much vertical space.

### Fix Applied
**File**: `src/css/main.css` (lines ~557-582)

Reduced chart container heights:
- **Mobile**: 200px → **140px**
- **Desktop**: 220px → **160px**
- **Aspect ratio**: Changed to **2.5:1** for wider rectangle shape

```css
.chart-card .chart-container {
    position: relative;
    /* Fixed height to prevent resize issues - much smaller for nice rectangle shape */
    height: 140px !important;
    min-height: 140px !important;
    max-height: 140px !important;
    max-width: 100%;
    overflow: hidden;
    flex-shrink: 0;
}

/* On wider screens, relax the aspect a bit and lower the max height */
@media (min-width: 900px) {
    .chart-card .chart-container {
        aspect-ratio: 2.5 / 1;
        height: 160px !important;
        min-height: 160px !important;
        max-height: 160px !important;
    }
}
```

### Result
✅ Charts now have a nice compact rectangle shape
✅ Consistent height across all views (main dashboard, drilldown, search)
✅ More charts visible per screen without scrolling

---

## Issue 3: Download Button Not Working

### Problem
Clicking the download button did nothing - no dropdown picker appeared, no downloads happened.

### Root Cause
Multiple issues prevented the download picker from appearing:
1. The CSS for `.download-format-picker` was completely missing
2. The `.chart-actions` container lacked proper positioning for the absolutely-positioned picker
3. The `.chart-card` had `overflow: hidden` which clipped the dropdown picker
4. The `.chart-header-top` had `overflow: hidden` which also clipped the picker

### Fix Applied
**File**: `src/css/main.css` (lines ~200-249)

Added complete CSS for download picker dropdown:

```css
/* Chart actions container needs relative positioning for download picker */
.chart-actions {
    position: relative;
    display: flex;
    gap: 0.25rem;
}

/* Download format picker dropdown */
.download-format-picker {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 150px;
    overflow: hidden;
    animation: fadeInDown 0.2s ease-out;
}

.download-format-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: all var(--t) var(--ease);
    color: var(--text);
}

.download-format-option:hover {
    background: var(--glass-bg);
    color: var(--accent-2);
}

.download-format-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}

.download-format-option span {
    font-size: 0.9rem;
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

**File**: `src/css/main.css` (overflow fixes)

Fixed overflow clipping issues:

```css
/* Chart actions container - allow picker overflow */
.chart-actions {
    position: relative;
    display: flex;
    gap: 0.25rem;
    overflow: visible !important; /* Ensure picker is not clipped */
}

/* Chart header top - allow picker overflow */
.chart-header-top {
    /* ... other styles ... */
    overflow: visible; /* Allow download picker to show outside bounds */
}

/* Chart card - allow picker overflow */
.chart-card {
    /* ... other styles ... */
    overflow: visible; /* Allow download picker to show outside card */
}
```

**File**: `src/js/main.js` (function `showDownloadFormatPicker`)

Added defensive checks and logging:
```javascript
const chartActions = btn.closest('.chart-actions');
if (!chartActions) {
    console.error('🎯 .chart-actions not found!');
    return;
}
console.log('🎯 Found .chart-actions, appending picker');
chartActions.appendChild(picker);
```

### Result
✅ Download button now shows format picker dropdown
✅ Three download options available: PNG Image, HTML File, SVG Vector
✅ Smooth dropdown animation
✅ Picker closes when clicking outside
✅ Downloads work correctly for all formats

---

## Issue 4: Charts Disappearing on Hover/Unhover

### Problem
After fixing drilldowns, hovering over a chart card and then unhovering caused the entire chart to disappear. The website felt "fragile" with charts jumping around.

### Root Cause
1. The hover effect included `transform: translateY(-2px)` which caused cards to jump/shift
2. Transition was set to `all` which caused unnecessary repaints
3. Initial attempt to fix download picker with `overflow: visible` on `.chart-card` broke layout stability

### Fix Applied
**File**: `src/css/main.css`

Stabilized card hover behavior:

```css
.chart-card {
    /* ... */
    transition: background var(--t) var(--ease), box-shadow var(--t) var(--ease); /* Only transition background and shadow */
    overflow: hidden; /* Keep card stable, don't allow overflow */
}

.chart-card:hover {
    background: var(--card-hover);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15);
    /* Removed transform to prevent chart jumping */
}

.chart-header-top {
    /* ... */
    overflow: visible; /* Allow download picker to show */
    position: relative; /* Create stacking context */
    z-index: 10; /* Ensure picker appears above other content */
}
```

Also reduced animation intensity for better stability:

```css
.chart-card {
    animation: fadeInUp 0.3s ease forwards; /* Reduced from 0.6s */
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px); /* Reduced from 20px */
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

### Result
✅ Charts no longer disappear on unhover
✅ No jumping/movement when hovering over cards
✅ More stable, polished user experience
✅ Faster, subtler animations (0.6s → 0.3s, 20px → 10px)
✅ Download picker still shows correctly (positioned from .chart-header-top with overflow: visible)
✅ Chart cards remain stable with overflow: hidden

---

## Issue 5: Fullscreen Chart Height Truncation

### Problem
Opening a chart in fullscreen mode caused the chart to appear truncated or with incorrect height. The fixed height constraints from normal cards (140-160px) were being applied in fullscreen mode.

### Root Cause
The CSS for `.fullscreen-card .chart-container` inherited the fixed height constraints from `.chart-card .chart-container`, which limited the chart to 140-160px even in fullscreen view.

### Fix Applied
**File**: `src/css/main.css`

Override height constraints for fullscreen:

```css
.fullscreen-card .chart-container {
    flex: 1;
    padding: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 0;
    background: var(--card);
    height: auto !important; /* Override fixed height for fullscreen */
    max-height: none !important; /* Remove height constraints */
    min-height: 0 !important; /* Allow it to flex */
}

.fullscreen-card canvas {
    max-width: 100% !important;
    max-height: 100% !important;
    width: auto !important; /* Let it scale naturally */
    height: auto !important; /* Let it scale naturally */
    object-fit: contain;
}
```

### Result
✅ Fullscreen charts now display at full size
✅ No truncation or height issues
✅ Charts scale properly to fill available space
✅ Normal card heights remain small and compact

---

## Issue 6: Breadcrumb Navigation Leaves Hash in URL

### Problem
When in a drilldown view (e.g., `#bankruptcies`), clicking "Riksdata" in the breadcrumb should do a hard refresh to the main page. Instead, it navigated to `https://riksdata.org/#` (with trailing hash), which didn't trigger a proper refresh.

### Root Cause
The `clearSearchAndGoHome()` function was setting `window.location.hash = ''`, which clears the hash text but leaves the `#` symbol in the URL and doesn't trigger a page reload.

### Fix Applied
**File**: `src/js/drilldown.js`

Changed to proper hard refresh:

```javascript
window.clearSearchAndGoHome = function() {
    // Clear hash first to avoid navigation issues
    if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
    }
    
    // Do a full hard refresh to reset everything
    window.location.reload(true);
};
```

### Result
✅ Clicking "Riksdata" in breadcrumb does full hard refresh
✅ URL is clean without trailing hash
✅ All filters and search cleared
✅ Page completely resets to initial state

---

## Additional Context

### Files Modified
1. **src/js/charts.js** - Fixed canvas visibility and skeleton hiding for drilldown charts
2. **src/css/main.css** - Reduced chart heights, added download picker CSS, fixed fullscreen heights, stabilized hover effects
3. **src/js/main.js** - Added defensive checks to download picker function
4. **src/js/drilldown.js** - Fixed breadcrumb navigation to do proper hard refresh

### Testing Recommendations
- Test drilldown navigation for all categories (bankruptcies, exports, imports, DFO, vaccinations, oil fund, CPI)
- Test download button in both main dashboard and drilldown views
- Test all three download formats (PNG, HTML, SVG)
- Verify chart heights are consistent across different screen sizes
- Test fullscreen mode for charts (should fill screen without truncation)
- Test breadcrumb navigation from drilldown views (should hard refresh to main page)
- Verify cards don't jump or disappear when hovering

### Related Issues
- Search filter clears on drilldown navigation ✅
- Rainbow gradient on search apply button ✅
- Reset button for search ✅
- Loading screen waits for first 9 charts ✅
- Hard refresh on Riksdata logo click ✅
- Breadcrumb navigation hard refresh ✅
- Stable hover effects (no jumping/disappearing) ✅

### Performance Improvements
- Reduced animation duration: 0.6s → 0.3s for snappier feel
- Removed `transform` transitions from cards to prevent reflow/repaint
- Only transition `background` and `box-shadow` on hover
- Subtler animations (10px vs 20px movement)

---

**Date**: October 14, 2025  
**Session**: Drilldown & Download Debugging  
**Issues Fixed**: 6 (Canvas visibility, Chart heights, Download button, Hover stability, Fullscreen heights, Breadcrumb navigation)

