// ============================================================================
// NORWAY TRADE SHARE GDP CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchTradeShareGdpData() {
    try {
        const response = await fetch('./data/static/norway_trade_share_gdp.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching trade share gdp data:', error);
        throw error;
    }
}

export async function renderTradeShareGdpChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchTradeShareGdpData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Trade Share Gdp');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for trade share gdp chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Trade Share Gdp'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Trade Share Gdp', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering trade share gdp chart:', error);
        throw error;
    }
}
