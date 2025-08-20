// ============================================================================
// NVE MAGASINSTATISTIKK DATA SOURCE
// ============================================================================

const BASE = 'https://biapi.nve.no/magasinstatistikk';

/**
 * Fetch JSON data from NVE API with error handling
 * @param {string} path - API endpoint path
 * @param {Object} opts - Fetch options
 * @returns {Promise<Object>} JSON response
 */
async function getJSON(path, opts = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { cache: 'no-store', ...opts });
  if (!res.ok) throw new Error(`NVE ${path} ${res.status}`);
  return res.json();
}

/**
 * Fetch available areas from NVE API
 * @returns {Promise<Array>} Array of area objects with areaId and areaName
 */
export async function fetchAreas() {
  // Returns [{ areaId, areaName }] e.g. Norge, NO1..NO5
  return getJSON('/api/Magasinstatistikk/HentOmråder');
}

/**
 * Fetch all reservoir data series from NVE API
 * @returns {Promise<Array>} Array of normalized reservoir data
 */
export async function fetchAllSeries() {
  // Returns weekly % for many years per area
  // Model typically includes: { aar, uke, omrade, fyllingsgrad }
  const rows = await getJSON('/api/Magasinstatistikk/HentOffentligData');
  
  // Normalize data
  return rows.map(r => ({
    year: Number(r.iso_aar),
    week: Number(r.iso_uke),
    area: r.omrade,            // "Norge", "NO1", ...
    fillPct: Number(r.fyllingsgrad) * 100, // Convert to percentage
    capacityTWh: Number(r.kapasitet_TWh),
    fillingTWh: Number(r.fylling_TWh),
    changePct: Number(r.endring_fyllingsgrad) * 100
  }));
}

/**
 * Fetch min/max/median statistics for the last 20 years
 * @returns {Promise<Array>} Array of statistical data
 */
export async function fetchMinMaxMedian() {
  // { omrade, uke, min, max, median } for last 20 years
  const rows = await getJSON('/api/Magasinstatistikk/HentOffentligDataMinMaxMedian');
  return rows.map(r => ({
    area: r.omrade,
    week: Number(r.uke),
    min: Number(r.min) * 100, // Convert to percentage
    max: Number(r.max) * 100, // Convert to percentage
    median: Number(r.median) * 100 // Convert to percentage
  }));
}

/**
 * Convert ISO week to Date (Monday of that week)
 * @param {number} year - Year
 * @param {number} week - ISO week number
 * @returns {Date} Monday of the specified week
 */
function isoWeekToDate(year, week) {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dow = simple.getUTCDay(); // 0..6
  const ISOweekStart = dow <= 4 ? 
    new Date(simple.setUTCDate(simple.getUTCDate() - (dow || 7) + 1)) :
    new Date(simple.setUTCDate(simple.getUTCDate() + (8 - dow)));
  return ISOweekStart; // Mon 00:00 UTC
}

/**
 * Build chart series for a specific area
 * @param {Array} all - All reservoir data
 * @param {Array} stats - Min/max/median statistics
 * @param {string} area - Area code (Norge, NO1, etc.)
 * @param {number} yearNow - Current year
 * @param {number} yearPrev - Previous year
 * @returns {Object} Chart series data
 */
export function buildSeriesForArea(all, stats, area, yearNow, yearPrev) {
  // Filter current year data
  const cur = all.filter(r => r.area === area && r.year === yearNow)
                 .map(r => ({ x: isoWeekToDate(r.year, r.week), y: r.fillPct }))
                 .sort((a,b) => a.x - b.x);
  
  // Filter previous year data
  const prev = all.filter(r => r.area === area && r.year === yearPrev)
                  .map(r => ({ x: isoWeekToDate(r.year, r.week), y: r.fillPct }))
                  .sort((a,b) => a.x - b.x);

  // Filter statistical band data
  const band = stats.filter(s => s.area === area)
                    .map(s => ({
                      week: s.week,
                      min: s.min,
                      max: s.max,
                      median: s.median,
                      x: isoWeekToDate(yearNow, s.week) // align band to current-year calendar
                    }))
                    .sort((a,b) => a.week - b.week);

  // For Chart.js band fill, we'll emit two datasets: min and max, and use fill between them
  const minSeries = band.map(b => ({ x: b.x, y: b.min }));
  const maxSeries = band.map(b => ({ x: b.x, y: b.max }));
  const medianSeries = band.map(b => ({ x: b.x, y: b.median }));

  return { cur, prev, minSeries, maxSeries, medianSeries };
}

/**
 * Get current and previous year for chart data
 * @returns {Object} Object with yearNow and yearPrev
 */
export function getChartYears() {
  const now = new Date();
  const yearNow = now.getFullYear();
  const yearPrev = yearNow - 1;
  return { yearNow, yearPrev };
}
