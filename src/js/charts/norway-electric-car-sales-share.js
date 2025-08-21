// ============================================================================
// NORWAY ELECTRIC CAR SALES SHARE CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchElectricCarSalesShareData() {
    try {
        const response = await fetch('/data/static/norway_electric_car_sales_share.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching electric car sales share data:', error);
        throw error;
    }
}

export async function renderElectricCarSalesShareChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchElectricCarSalesShareData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Electric Car Sales Share');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for electric car sales share chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Electric Car Sales Share'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Electric Car Sales Share', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering electric car sales share chart:', error);
        throw error;
    }
}
