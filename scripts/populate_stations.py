import json
import requests
import os

def populate_stations():
    url = "https://raw.githubusercontent.com/datameet/railways/master/stations.json"
    try:
        print(f"Fetching data from {url}...")
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        stations = []
        print("Parsing station data...")
        
        # The datameet file is a GeoJSON FeatureCollection
        for feature in data.get('features', []):
            props = feature.get('properties', {})
            code = props.get('code')
            name = props.get('name')
            zone = props.get('zone')
            
            if code and name:
                stations.append({
                    "code": code,
                    "name": name,
                    "zone": zone if zone else "Unknown"
                })
        
        # Sort by code for better readability
        stations.sort(key=lambda x: x['code'])
        
        output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'stations.json')
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(stations, f, indent=4)
            
        print(f"Successfully populated {len(stations)} stations to {output_path}")
        
    except Exception as e:
        print(f"Error populating stations: {e}")

if __name__ == "__main__":
    populate_stations()
