// ============================================================================
// NORWAY VACCINATION COVERAGE CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchVaccinationCoverageData() {
    try {
        const response = await fetch('/data/static/norway_vaccination_coverage.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching vaccination coverage data:', error);
        throw error;
    }
}

export async function renderVaccinationCoverageChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchVaccinationCoverageData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Vaccination Coverage');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for vaccination coverage chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Vaccination Coverage'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Vaccination Coverage', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering vaccination coverage chart:', error);
        throw error;
    }
}
