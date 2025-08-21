// ============================================================================
// NORWAY TOURIST TRIPS CHART RENDERING
// ============================================================================

import { registerChartData } from '../registry.js';
import { parseStaticData } from '../charts.js';
import { renderChart } from '../charts.js';

async function fetchTouristTripsData() {
    try {
        const response = await fetch('./data/static/norway_tourist_trips.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching tourist trips data:', error);
        throw error;
    }
}

export async function renderTouristTripsChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { 
        console.warn(`Canvas with id '${canvasId}' not found`); 
        return null; 
    }

    try {
        const data = await fetchTouristTripsData();
        
        // Parse data using the standard static data parser
        const parsedData = parseStaticData(data, 'Norway Tourist Trips');
        
        if (!parsedData || parsedData.length === 0) {
            console.warn('No data available for tourist trips chart');
            return null;
        }

        // Register data for export
        const exportData = parsedData.map(d => ({
            date: d.date,
            value: d.value,
            series: 'Tourist Trips'
        }));
        registerChartData(canvasId, exportData);

        // Use the standard renderChart function with political color overlays
        const chart = renderChart(canvas, parsedData, 'Norway Tourist Trips', 'line');
        
        return chart;
    } catch (error) {
        console.error('Error rendering tourist trips chart:', error);
        throw error;
    }
}
