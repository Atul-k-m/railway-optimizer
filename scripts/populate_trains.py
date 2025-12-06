import json
import requests
import os
import math

def populate_trains():
    trains_url = "https://raw.githubusercontent.com/datameet/railways/master/trains.json"
    schedules_url = "https://raw.githubusercontent.com/datameet/railways/master/schedules.json"
    
    try:
        print("Fetching trains data...")
        # trains.json is GeoJSON
        trains_resp = requests.get(trains_url)
        trains_resp.raise_for_status()
        trains_data = trains_resp.json()
        
        print("Fetching schedules data...")
        # schedules.json is a list of stops
        schedules_resp = requests.get(schedules_url)
        schedules_resp.raise_for_status()
        schedules_data = schedules_resp.json()
        
        # Index schedules by train number
        print("Indexing schedules...")
        schedules_by_train = {}
        for stop in schedules_data:
            # Adjust keys based on actual likely structure. 
            # Datameet schedules usually have 'train_number', 'station_code', 'arrival', 'departure', 'day'
            # Let's try to handle potential key variations gently or just assume standard ones
            t_num = stop.get('train_number')
            if not t_num: continue
            
            if t_num not in schedules_by_train:
                schedules_by_train[t_num] = []
            
            schedules_by_train[t_num].append(stop)
            
        final_trains = []
        
        print("Processing trains...")
        for feature in trains_data.get('features', []):
            props = feature.get('properties', {})
            number = props.get('number')
            name = props.get('name')
            
            if not number or not name:
                continue
                
            train_schedule = schedules_by_train.get(number, [])
            if not train_schedule:
                continue
                
            # Sort schedule by some sequence if available, or just assume it's ordered?
            # Datameet schedules often don't have a specific sequence number, but usually come in order.
            # We will trust the order or try to sort by day/time if keys exist.
            # safe sort: day -> arrival
            def parse_time(t_str):
                if not t_str or t_str == 'None': return 0
                try:
                    h, m = map(int, t_str.split(':'))
                    return h * 60 + m
                except:
                    return 0

            train_schedule.sort(key=lambda x: (int(x.get('day') or 1), parse_time(x.get('arrival'))))
            
            clean_schedule = []
            distance = 0
            
            for i, stop in enumerate(train_schedule):
                arrival = stop.get('arrival', '00:00')
                departure = stop.get('departure', '00:00')
                if arrival == 'None': arrival = '00:00'
                if departure == 'None': departure = '00:00'
                
                # Mock distance calculation if not present
                # In real app we'd need lat/long usage or real data
                # Here uses a simple increment for demo purposes if dist missing
                # But datameet schedules might NOT have distance.
                # Let's randomize/mock it roughly or check if 'distance' key exists
                stop_dist = stop.get('distance')
                if stop_dist is None:
                    # Simple heuristic: 50km between stops
                    distance += 50 if i > 0 else 0
                else:
                    distance = int(stop_dist)
                
                clean_schedule.append({
                    "station": stop.get('station_code'),
                    "arrival": arrival,
                    "departure": departure,
                    "day": int(stop.get('day') or 1),
                    "dist": distance
                })
            
            # Base fares mock
            total_dist = clean_schedule[-1]['dist']
            base_fares = {
                "SL": int(200 + total_dist * 0.45),
                "3A": int(500 + total_dist * 1.2),
                "2A": int(800 + total_dist * 1.8)
            }
            
            final_trains.append({
                "number": number,
                "name": name,
                "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], # Default to daily
                "classes": ["SL", "3A", "2A"],
                "schedule": clean_schedule,
                "base_fares": base_fares
            })
            
        output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'trains.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(final_trains, f, indent=4)
            
        print(f"Successfully populated {len(final_trains)} trains to {output_path}")

    except Exception as e:
        print(f"Error populating trains: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    populate_trains()
