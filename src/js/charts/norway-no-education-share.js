// ============================================================================
// NORWAY NO EDUCATION SHARE CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchNoEducationShareData() {
    try {
        const response = await fetch('./data/static/norway_no_education_share.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching no education share data:', error);
        throw error;
    }
}

export async function renderNoEducationShareChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchNoEducationShareData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway No Education Share');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for no education share chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'No Education Share'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway No Education Share', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering no education share chart:', error);
        throw error;
    }
}
