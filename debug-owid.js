// Debug script to test OWID data parsing
import { parseStaticData } from './src/js/charts.js';

// Test with actual OWID data structure
const testData = {
  "dataset": "total-alcohol-consumption-per-capita-litres-of-pure-alcohol (WHO via World Bank, OWID processed)",
  "country": "Norway",
  "metadata": {
    "title": "Total alcohol consumption per capita (litres of pure alcohol, 15+)",
    "variable": "sh_alc_pcap_li",
    "unit": "liters of pure alcohol per person (15+) per year"
  },
  "data": [
    {
      "Entity": "Norway",
      "Code": "NOR",
      "Year": 2000,
      "value": 6.63
    },
    {
      "Entity": "Norway", 
      "Code": "NOR",
      "Year": 2001,
      "value": 6.63
    },
    {
      "Entity": "Norway",
      "Code": "NOR", 
      "Year": 2002,
      "value": 6.76
    }
  ]
};

console.log('Testing parseStaticData with OWID format...');
console.log('Input data:', testData);

const result = parseStaticData(testData, 'Alcohol Consumption per Capita');
console.log('Parsed result:', result);
console.log('Result length:', result.length);
