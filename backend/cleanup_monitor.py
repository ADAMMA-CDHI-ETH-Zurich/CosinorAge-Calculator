#!/usr/bin/env python3
"""
Cleanup Monitor Script for CosinorLab
This script can be used to monitor and manage the cleanup process
"""

import requests
import json
import time
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:8000"  # Adjust if your API runs on a different port

def get_cleanup_config():
    """Get current cleanup configuration"""
    try:
        response = requests.get(f"{API_BASE_URL}/cleanup/config")
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error getting config: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error connecting to API: {e}")
        return None

def update_cleanup_config(interval_minutes=None, age_limit_minutes=None):
    """Update cleanup configuration"""
    config = {}
    if interval_minutes is not None:
        config["cleanup_interval_minutes"] = interval_minutes
    if age_limit_minutes is not None:
        config["file_age_limit_minutes"] = age_limit_minutes
    
    if not config:
        print("No configuration provided")
        return
    
    try:
        response = requests.post(f"{API_BASE_URL}/cleanup/config", json=config)
        if response.status_code == 200:
            result = response.json()
            print(f"Configuration updated: {result}")
        else:
            print(f"Error updating config: {response.status_code}")
    except Exception as e:
        print(f"Error connecting to API: {e}")

def trigger_cleanup():
    """Manually trigger cleanup"""
    try:
        response = requests.post(f"{API_BASE_URL}/cleanup/trigger")
        if response.status_code == 200:
            result = response.json()
            print(f"Cleanup triggered: {result}")
        else:
            print(f"Error triggering cleanup: {response.status_code}")
    except Exception as e:
        print(f"Error connecting to API: {e}")

def monitor_cleanup():
    """Monitor cleanup status"""
    print("Monitoring cleanup status...")
    print("Press Ctrl+C to stop")
    
    try:
        while True:
            config = get_cleanup_config()
            if config:
                print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}]")
                print(f"Cleanup interval: {config['cleanup_interval_minutes']} minutes")
                print(f"File age limit: {config['file_age_limit_minutes']} minutes")
                print(f"Files tracked: {config['files_tracked']}")
                print(f"Temp dirs tracked: {config['temp_dirs_tracked']}")
                if config['next_cleanup_in_minutes'] > 0:
                    print(f"Next cleanup in: {config['next_cleanup_in_minutes']} minutes")
                else:
                    print("Cleanup task currently running")
            
            time.sleep(60)  # Check every minute
            
    except KeyboardInterrupt:
        print("\nMonitoring stopped")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python cleanup_monitor.py config                    # Show current config")
        print("  python cleanup_monitor.py update <interval> <age>   # Update config")
        print("  python cleanup_monitor.py trigger                   # Trigger cleanup")
        print("  python cleanup_monitor.py monitor                   # Monitor status")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "config":
        config = get_cleanup_config()
        if config:
            print(json.dumps(config, indent=2))
    
    elif command == "update":
        if len(sys.argv) < 4:
            print("Usage: python cleanup_monitor.py update <interval_minutes> <age_limit_minutes>")
            sys.exit(1)
        interval = int(sys.argv[2])
        age_limit = int(sys.argv[3])
        update_cleanup_config(interval, age_limit)
    
    elif command == "trigger":
        trigger_cleanup()
    
    elif command == "monitor":
        monitor_cleanup()
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1) 