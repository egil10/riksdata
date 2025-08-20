// ============================================================================
// NVE MAGASINSTATISTIKK DATA SOURCE
// ============================================================================

/**
 * Fetch JSON data from cached NVE files
 * @param {string} filename - Cache file name
 * @returns {Promise<Object>} JSON response
 */
async function getCachedJSON(filename) {
  const url = `data/cached/nve/${filename}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NVE cache ${filename} ${res.status}`);
  const data = await res.json();
  return data.data; // Return the data array from the cached structure
}

/**
 * Fetch available areas from cached NVE data
 * @returns {Promise<Array>} Array of area objects
 */
export async function fetchAreas() {
  return getCachedJSON('areas.json');
}

/**
 * Fetch all reservoir data series from cached NVE data
 * @returns {Promise<Array>} Array of normalized reservoir data
 */
export async function fetchAllSeries() {
  // Returns weekly % for many years per area
  // Data is already normalized in the cache
  return getCachedJSON('all-series.json');
}

/**
 * Fetch min/max/median statistics from cached NVE data
 * @returns {Promise<Array>} Array of statistical data
 */
export async function fetchMinMaxMedian() {
  // Data is already normalized in the cache
  return getCachedJSON('min-max-median.json');
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
