#!/usr/bin/env python3
"""
Riksdata Data Validator
Validates cached data for completeness and integrity
"""

import json
import os
from pathlib import Path
import logging
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RiksdataValidator:
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent
        self.cache_dir = self.base_dir / "data" / "cached"
        self.static_dir = self.base_dir / "data" / "static"
        
    def validate_ssb_data(self, data, dataset_name):
        """Validate SSB data structure"""
        # SSB data can have different structures, let's be more flexible
        if not isinstance(data, dict):
            return False, "Data is not a JSON object"
        
        # Check if it has any of the expected SSB structures
        if 'dataset' in data:
            # Standard SSB dataset structure
            dataset = data['dataset']
            if not isinstance(dataset, dict):
                return False, "Dataset is not an object"
            
            # Check for basic required fields
            if 'dimension' not in dataset:
                return False, "Missing dimension field"
            
            if 'value' not in dataset:
                return False, "Missing value field"
            
            # Check for time dimension
            if 'Tid' not in dataset['dimension']:
                return False, "Missing time dimension (Tid)"
            
            # Check for values
            if not dataset['value'] or len(dataset['value']) == 0:
                return False, "No data values found"
                
        elif 'data' in data:
            # Alternative SSB structure
            if not isinstance(data['data'], dict):
                return False, "Data field is not an object"
                
        else:
            return False, "No recognized SSB data structure found"
        
        return True, "Valid SSB data"
    
    def validate_norges_bank_data(self, data, dataset_name):
        """Validate Norges Bank data structure"""
        if not isinstance(data, dict):
            return False, "Data is not a JSON object"
        
        # Norges Bank uses SDMX-JSON format
        if 'data' not in data:
            return False, "Missing data field"
        
        data_obj = data['data']
        if not isinstance(data_obj, dict):
            return False, "Data field is not an object"
        
        # Check for dataSets (SDMX structure)
        if 'dataSets' not in data_obj:
            return False, "Missing dataSets field"
        
        dataSets = data_obj['dataSets']
        if not dataSets or len(dataSets) == 0:
            return False, "No dataSets found"
        
        # Check for series in the first dataset
        dataSet = dataSets[0]
        if 'series' not in dataSet:
            return False, "No series field in dataSet"
        
        series = dataSet['series']
        if not series:
            return False, "No series data found"
        
        return True, "Valid Norges Bank data"
    
    def validate_metadata(self, data):
        """Validate metadata structure"""
        if '_metadata' not in data:
            return False, "Missing metadata"
        
        metadata = data['_metadata']
        required_fields = ['source', 'fetched_at']
        
        for field in required_fields:
            if field not in metadata:
                return False, f"Missing metadata field: {field}"
        
        return True, "Valid metadata"
    
    def check_data_freshness(self, data, max_age_hours=24):
        """Check if data is fresh enough"""
        if '_metadata' not in data or 'fetched_at' not in data['_metadata']:
            return False, "No fetch timestamp found"
        
        try:
            fetched_at = datetime.fromisoformat(data['_metadata']['fetched_at'])
            age = datetime.now() - fetched_at
            
            if age > timedelta(hours=max_age_hours):
                return False, f"Data is {age.total_seconds() / 3600:.1f} hours old"
            
            return True, f"Data is {age.total_seconds() / 3600:.1f} hours old"
            
        except Exception as e:
            return False, f"Invalid timestamp format: {e}"
    
    def validate_file(self, filepath):
        """Validate a single data file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Basic JSON validation
            if not isinstance(data, dict):
                return False, "Data is not a JSON object"
            
            # Check metadata
            metadata_valid, metadata_msg = self.validate_metadata(data)
            if not metadata_valid:
                return False, metadata_msg
            
            # Check data freshness
            freshness_valid, freshness_msg = self.check_data_freshness(data)
            if not freshness_valid:
                logger.warning(f"{filepath.name}: {freshness_msg}")
            
            # Source-specific validation
            source = data['_metadata']['source']
            if source == 'SSB':
                valid, msg = self.validate_ssb_data(data, filepath.stem)
            elif source == 'Norges Bank':
                valid, msg = self.validate_norges_bank_data(data, filepath.stem)
            else:
                return False, f"Unknown source: {source}"
            
            return valid, msg
            
        except json.JSONDecodeError as e:
            return False, f"Invalid JSON: {e}"
        except Exception as e:
            return False, f"Validation error: {e}"
    
    def run_validation(self):
        """Run complete validation of all cached data"""
        logger.info("Starting data validation...")
        
        if not self.cache_dir.exists():
            logger.error("Cache directory does not exist")
            return False
        
        validation_results = {
            'total_files': 0,
            'valid_files': 0,
            'invalid_files': 0,
            'errors': []
        }
        
        # Validate all JSON files in cache
        for filepath in self.cache_dir.rglob('*.json'):
            if filepath.name == 'metadata.json':
                continue
                
            validation_results['total_files'] += 1
            
            valid, message = self.validate_file(filepath)
            
            if valid:
                validation_results['valid_files'] += 1
                logger.info(f"✅ {filepath.name}: {message}")
            else:
                validation_results['invalid_files'] += 1
                error_msg = f"❌ {filepath.name}: {message}"
                validation_results['errors'].append(error_msg)
                logger.error(error_msg)
        
        # Summary
        logger.info(f"\n📊 Validation Summary:")
        logger.info(f"   Total files: {validation_results['total_files']}")
        logger.info(f"   Valid files: {validation_results['valid_files']}")
        logger.info(f"   Invalid files: {validation_results['invalid_files']}")
        
        if validation_results['errors']:
            logger.info(f"\n❌ Errors found:")
            for error in validation_results['errors']:
                logger.info(f"   {error}")
        
        success_rate = (validation_results['valid_files'] / validation_results['total_files']) * 100 if validation_results['total_files'] > 0 else 0
        logger.info(f"\n📈 Success rate: {success_rate:.1f}%")
        
        return validation_results['invalid_files'] == 0

if __name__ == "__main__":
    validator = RiksdataValidator()
    success = validator.run_validation()
    
    if success:
        logger.info("🎉 All data validation passed!")
        exit(0)
    else:
        logger.error("❌ Data validation failed!")
        exit(1)
