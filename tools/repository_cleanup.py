#!/usr/bin/env python3
"""
Repository Cleanup and Organization
Organizes files into proper folders and removes clutter
"""

import json
import logging
import shutil
from pathlib import Path
from datetime import datetime

class RepositoryCleanup:
    def __init__(self):
        self.moved_files = []
        self.removed_files = []
        
    def create_directories(self):
        """Create necessary directories if they don't exist"""
        directories = [
            "docs/reports",
            "data/reports", 
            "data/logs",
            "scripts/tools"
        ]
        
        for directory in directories:
            Path(directory).mkdir(parents=True, exist_ok=True)
            logging.info(f"Created directory: {directory}")
    
    def organize_diagnostic_files(self):
        """Move diagnostic and report files to proper locations"""
        
        # Move diagnostic reports to docs/reports
        diagnostic_files = [
            "diagnostics_report.md",
            "diagnostics_results.json", 
            "comprehensive_cleanup_report.json",
            "final_fixes_report.json",
            "chart_quality_report.json"
        ]
        
        for file in diagnostic_files:
            if Path(file).exists():
                source = Path(file)
                destination = Path("docs/reports") / file
                shutil.move(str(source), str(destination))
                self.moved_files.append(f"docs/reports/{file}")
                logging.info(f"Moved {file} to docs/reports/")
        
        # Move temp files to data/reports
        temp_files = [
            "data/temp/excluded_charts_report.json",
            "data/temp/chart_quality_report.json", 
            "data/temp/realistic_expansion.json",
            "data/temp/repair_results.json",
            "data/temp/diagnostics_results.json",
            "data/temp/expansion_results.json"
        ]
        
        for file in temp_files:
            if Path(file).exists():
                source = Path(file)
                destination = Path("data/reports") / source.name
                shutil.move(str(source), str(destination))
                self.moved_files.append(f"data/reports/{source.name}")
                logging.info(f"Moved {source.name} to data/reports/")
    
    def organize_log_files(self):
        """Move log files to proper locations"""
        
        # Move log files to data/logs
        log_files = [
            "diagnostics.log",
            "expand.log"
        ]
        
        for file in log_files:
            if Path(file).exists():
                source = Path(file)
                destination = Path("data/logs") / file
                shutil.move(str(source), str(destination))
                self.moved_files.append(f"data/logs/{file}")
                logging.info(f"Moved {file} to data/logs/")
    
    def organize_scripts(self):
        """Organize script files"""
        
        # Move diagnostic and cleanup scripts to scripts/tools
        tool_scripts = [
            "scripts/diagnostics.py",
            "scripts/repair.py", 
            "scripts/final_fixes.py",
            "scripts/comprehensive_cleanup.py"
        ]
        
        for script in tool_scripts:
            if Path(script).exists():
                source = Path(script)
                destination = Path("scripts/tools") / source.name
                shutil.move(str(source), str(destination))
                self.moved_files.append(f"scripts/tools/{source.name}")
                logging.info(f"Moved {source.name} to scripts/tools/")
    
    def remove_duplicate_files(self):
        """Remove duplicate and unnecessary files"""
        
        # Remove duplicate expansion_results.json from root
        if Path("expansion_results.json").exists():
            Path("expansion_results.json").unlink()
            self.removed_files.append("expansion_results.json")
            logging.info("Removed duplicate expansion_results.json from root")
        
        # Remove empty temp directory
        temp_dir = Path("data/temp")
        if temp_dir.exists() and not any(temp_dir.iterdir()):
            temp_dir.rmdir()
            logging.info("Removed empty data/temp directory")
    
    def update_references(self):
        """Update any file references that might be broken"""
        
        # Update README.md if it references moved files
        readme_path = Path("README.md")
        if readme_path.exists():
            with open(readme_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Update any references to moved files
            content = content.replace("scripts/diagnostics.py", "scripts/tools/diagnostics.py")
            content = content.replace("scripts/repair.py", "scripts/tools/repair.py")
            
            with open(readme_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logging.info("Updated README.md references")
    
    def create_cleanup_report(self):
        """Create a report of all cleanup operations"""
        report = {
            "cleanup_timestamp": datetime.now().isoformat(),
            "moved_files": self.moved_files,
            "removed_files": self.removed_files,
            "summary": {
                "total_moved": len(self.moved_files),
                "total_removed": len(self.removed_files)
            }
        }
        
        with open("docs/reports/repository_cleanup_report.json", 'w') as f:
            json.dump(report, f, indent=2)
        
        logging.info(f"Repository cleanup report saved to docs/reports/repository_cleanup_report.json")
    
    def verify_paths(self):
        """Verify that all important paths still work"""
        
        # Check if main files are accessible
        important_files = [
            "index.html",
            "src/js/main.js",
            "src/js/charts.js",
            "src/js/config.js",
            "src/css/main.css",
            "data/cached/metadata.json"
        ]
        
        for file in important_files:
            if Path(file).exists():
                logging.info(f"✅ {file} - OK")
            else:
                logging.warning(f"❌ {file} - MISSING")
        
        # Check if moved files are accessible
        for moved_file in self.moved_files:
            if Path(moved_file).exists():
                logging.info(f"✅ {moved_file} - OK")
            else:
                logging.warning(f"❌ {moved_file} - MISSING")
    
    def run_cleanup(self):
        """Run all cleanup operations"""
        logging.info("Starting repository cleanup and organization...")
        
        # 1. Create directories
        self.create_directories()
        
        # 2. Organize diagnostic files
        self.organize_diagnostic_files()
        
        # 3. Organize log files
        self.organize_log_files()
        
        # 4. Organize scripts
        self.organize_scripts()
        
        # 5. Remove duplicates
        self.remove_duplicate_files()
        
        # 6. Update references
        self.update_references()
        
        # 7. Create cleanup report
        self.create_cleanup_report()
        
        # 8. Verify paths
        self.verify_paths()
        
        logging.info("Repository cleanup completed!")

def main():
    """Main cleanup runner"""
    logging.basicConfig(level=logging.INFO)
    
    cleanup = RepositoryCleanup()
    cleanup.run_cleanup()

if __name__ == "__main__":
    main()
