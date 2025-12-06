import json
import os
from typing import List, Optional, Dict
from datetime import datetime
from src.models import Train, Station, ScheduleItem

class DataManager:
    def __init__(self, data_dir: str):
        self.stations_file = os.path.join(data_dir, 'stations.json')
        self.station_train_map: Dict[str, List[Train]] = {}
        self.trains_file = os.path.join(data_dir, 'trains.json')
        self.trains: List[Train] = []
        self.load_data()

    def load_data(self):
        with open(self.stations_file, 'r') as f:
            s_data = json.load(f)
            self.stations = [Station(**s) for s in s_data]
            
        with open(self.trains_file, 'r') as f:
            t_data = json.load(f)
            for t in t_data:
                schedule = [ScheduleItem(**s) for s in t['schedule']]
                train = Train(
                    number=t['number'],
                    name=t['name'],
                    days=t['days'],
                    classes=t['classes'],
                    schedule=schedule,
                    base_fares=t['base_fares']
                )
                self.trains.append(train)
                
                # Indexing
                for stop in schedule:
                    if stop.station not in self.station_train_map:
                        self.station_train_map[stop.station] = []
                    self.station_train_map[stop.station].append(train)

    def get_station_by_code(self, code: str) -> Optional[Station]:
        for s in self.stations:
            if s.code.upper() == code.upper():
                return s
        return None

    def get_trains_between(self, source: str, destination: str, travel_date: datetime) -> List[Train]:
        # Simple day of week check
        day_of_week_map = {0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 4: "Fri", 5: "Sat", 6: "Sun"}
        day_str = day_of_week_map[travel_date.weekday()]
        
        # Optimization: Use intersection of trains at source and trains at dest
        trains_at_source = self.station_train_map.get(source, [])
        trains_at_dest = self.station_train_map.get(destination, [])
        
        # Intersection
        common_trains = set(trains_at_source) & set(trains_at_dest)
        
        valid_trains = []
        for train in common_trains:
            if day_str not in train.days:
                continue
            
            src_sched = train.get_schedule_for_station(source)
            dest_sched = train.get_schedule_for_station(destination)
            
            if src_sched and dest_sched:
                # Basic check: destination must appear after source in the schedule list
                # Assuming schedule is ordered
                # Optimization: compare distances or indices
                # Using distances is safer if available, but indices work if schedule is sorted
                if dest_sched.dist > src_sched.dist:
                    valid_trains.append(train)
        return valid_trains
