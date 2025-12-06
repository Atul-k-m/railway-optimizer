import requests
import json

def inspect_url(url, name):
    print(f"--- Inspecting {name} ---")
    try:
        response = requests.get(url) # Removed stream=True to let requests handle auto-decompress
        response.raise_for_status()
        
        # Print first 1000 chars
        print(response.text[:1000])
        print("\n---------------------------\n")
    except Exception as e:
        print(f"Error fetching {name}: {e}")

if __name__ == "__main__":
    inspect_url("https://raw.githubusercontent.com/datameet/railways/master/trains.json", "trains.json")
    inspect_url("https://raw.githubusercontent.com/datameet/railways/master/schedules.json", "schedules.json")
