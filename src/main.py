import argparse
from datetime import datetime
import sys
import os

# Ensure we can import src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.data_manager import DataManager
from src.optimizer import JourneyOptimizer

def main():
    parser = argparse.ArgumentParser(description="Railway Journey Optimizer")
    parser.add_argument('source', help="Source Station Code (e.g., SBC)")
    parser.add_argument('destination', help="Destination Station Code (e.g., VSG)")
    parser.add_argument('date', help="Travel Date (DD-MM-YYYY)")
    parser.add_argument('--pclass', default='SL', help="Preferred Class (SL, 3A, 2A). Default: SL")
    
    args = parser.parse_args()
    
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
    dm = DataManager(data_dir)
    optimizer = JourneyOptimizer(dm)
    
    try:
        travel_date = datetime.strptime(args.date, "%d-%m-%Y")
    except ValueError:
        print("Error: Invalid date format. Use DD-MM-YYYY")
        return

    print(f"\nSearching trains from {args.source} to {args.destination} on {args.date} (Class: {args.pclass})...\n")

    options = optimizer.get_best_options(args.source, args.destination, travel_date, args.pclass)
    
    if not options:
        print("No routes found.")
        return

    print(f"Found {len(options)} options. Showing top {min(len(options), 5)}:\n")
    
    for i, opt in enumerate(options, 1):
        stops_msg = "Direct" if opt.total_transfers == 0 else f"Break at {opt.via}"
        print(f"Option {i} ({stops_msg}) — ₹{opt.total_fare} — {opt.total_duration_str}")
        
        for leg_idx, leg in enumerate(opt.legs, 1):
            if leg.wait_time_before > 0:
                 hours = leg.wait_time_before // 60
                 mins = leg.wait_time_before % 60
                 print(f"   [Layover: {hours}h {mins}m at {leg.source}]")
                 
            print(f"   Leg {leg_idx}: {leg.train.number} {leg.train.name} | {leg.source} ({leg.dep_time}) -> {leg.destination} ({leg.arr_time}) | ₹{leg.fare}")
        
        print("")

if __name__ == "__main__":
    main()
