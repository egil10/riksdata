// ============================================================================
// NORWAY MEAN INCOME PER DAY CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchMeanIncomePerDayData() {
    try {
        const response = await fetch('/data/static/norway_mean_income_per_day.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching mean income per day data:', error);
        throw error;
    }
}

export async function renderMeanIncomePerDayChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchMeanIncomePerDayData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Mean Income Per Day');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for mean income per day chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Mean Income Per Day'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Mean Income Per Day', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering mean income per day chart:', error);
        throw error;
    }
}
