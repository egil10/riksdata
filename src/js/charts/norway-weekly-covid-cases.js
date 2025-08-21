// ============================================================================
// NORWAY WEEKLY COVID CASES CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchWeeklyCovidCasesData() {
    try {
        const response = await fetch('/data/static/norway_weekly_covid_cases.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching weekly covid cases data:', error);
        throw error;
    }
}

export async function renderWeeklyCovidCasesChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchWeeklyCovidCasesData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Weekly Covid Cases');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for weekly covid cases chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Weekly Covid Cases'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Weekly Covid Cases', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering weekly covid cases chart:', error);
        throw error;
    }
}
