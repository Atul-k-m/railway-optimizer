from typing import List, Tuple, Dict
from datetime import datetime, timedelta
from src.models import Train, Station, Itinerary, JourneyLeg
from src.data_manager import DataManager

class JourneyOptimizer:
    def __init__(self, data_manager: DataManager):
        self.dm = data_manager

    def parse_time(self, time_str: str) -> timedelta:
        parts = list(map(int, time_str.split(':')))
        if len(parts) == 3:
            h, m, s = parts
        else:
            h, m = parts
            s = 0
        return timedelta(hours=h, minutes=m, seconds=s)

    def calculate_duration_minutes(self, start_day: int, start_time: str, end_day: int, end_time: str) -> int:
        start = self.parse_time(start_time) + timedelta(days=start_day-1)
        end = self.parse_time(end_time) + timedelta(days=end_day-1)
        diff = end - start
        return int(diff.total_seconds() / 60)

    def get_arrival_datetime(self, start_date: datetime, start_train_day: int, arr_train_day: int, arr_time_str: str) -> datetime:
        # Train departs on start_date.
        # start_train_day is usually 1, but if boarding at intermediate, might be >1. 
        # Actually logic is: Travel Date corresponds to the day the train departs from ORIGINAL Source? 
        # No, Indian railways usually lists 'days' as running days from Source. 
        # But here we simplified: 'days' in JSON are days the train runs from its origin. 
        # For simplicity in this mock, let's assume 'days' is when it departs the boarding station if boarding at origin?
        # A better simplifcation for this mock: 'days' list are the days of weak the train is available at the BOARDING station.
        # (Real world is complex).
        # Let's assume 'days' checking in DataManager filters correctly for the boarding date.
        
        # arrival_date = start_date + (arr_train_day - start_train_day)
        # But we need to handle specific time.
        
        days_delta = arr_train_day - start_train_day
        base_date = start_date + timedelta(days=days_delta)
        parts = list(map(int, arr_time_str.split(':')))
        if len(parts) == 3:
            h, m, s = parts
        else:
            h, m = parts
            s = 0
        return base_date.replace(hour=h, minute=m, second=s, microsecond=0)

    def find_direct_routes(self, source: str, destination: str, date: datetime, preferred_class: str) -> List[Itinerary]:
        trains = self.dm.get_trains_between(source, destination, date)
        itineraries = []
        
        for train in trains:
            src_sched = train.get_schedule_for_station(source)
            dest_sched = train.get_schedule_for_station(destination)
            
            if preferred_class not in train.base_fares and preferred_class != 'Any':
                 continue
            
            # Use specific class fare or lowest available if 'Any' (logic can be improved)
            fare_class = preferred_class if preferred_class in train.base_fares else list(train.base_fares.keys())[0]
            fare = train.base_fares.get(fare_class, 0)

            duration = self.calculate_duration_minutes(
                src_sched.day, src_sched.departure,
                dest_sched.day, dest_sched.arrival
            )

            leg = JourneyLeg(
                train=train,
                source=source,
                destination=destination,
                dep_time=src_sched.departure,
                arr_time=dest_sched.arrival,
                duration=duration,
                fare=fare,
                travel_class=fare_class,
                dist=dest_sched.dist - src_sched.dist
            )
            
            itinerary = Itinerary(
                legs=[leg],
                total_fare=fare,
                total_duration_minutes=duration,
                total_transfers=0,
                route_type="Direct"
            )
            itineraries.append(itinerary)
            
        return itineraries

    def find_break_journeys(self, source: str, destination: str, date: datetime, preferred_class: str) -> List[Itinerary]:
        itineraries = []
        
        # Optimization: Identify potential intermediates by intersecting reachable sets
        trains_from_source = self.dm.station_train_map.get(source, [])
        trains_at_dest = self.dm.station_train_map.get(destination, [])
        
        reachable_stations = set()
        for t in trains_from_source:
             # Add all stations AFTER source in this train's schedule
             src_sched = t.get_schedule_for_station(source)
             if src_sched:
                 for stop in t.schedule:
                     if stop.dist > src_sched.dist:
                         reachable_stations.add(stop.station)
                         
        stations_reaching_dest = set()
        for t in trains_at_dest:
            # Add all stations BEFORE dest in this train's schedule
            dest_sched = t.get_schedule_for_station(destination)
            if dest_sched:
                for stop in t.schedule:
                    if stop.dist < dest_sched.dist:
                        stations_reaching_dest.add(stop.station)
        
        # Intermediates must be in both sets
        # Also exclude source and dest themselves
        possible_intermediates = (reachable_stations & stations_reaching_dest) - {source, destination}
        
        print(f"DEBUG: Found {len(possible_intermediates)} potential intermediate stations")
        
        # Limit to top N intermediates to avoid timeout if still too many
        # For now, process all as the set should be much smaller than 8000
        
        chunk_intermediates = list(possible_intermediates)[:50] # Hard limit for performance demo
        
        for inter in chunk_intermediates:
            # Leg 1: Source -> Inter
            leg1_trains = self.dm.get_trains_between(source, inter, date)
            
            for t1 in leg1_trains:
                s1_sched = t1.get_schedule_for_station(source)
                i1_sched = t1.get_schedule_for_station(inter)
                
                # Filter class
                if preferred_class != 'Any' and preferred_class not in t1.base_fares:
                    continue
                c1 = preferred_class if preferred_class in t1.base_fares else list(t1.base_fares.keys())[0]
                fare1 = t1.base_fares.get(c1, 0)
                
                dur1 = self.calculate_duration_minutes(s1_sched.day, s1_sched.departure, i1_sched.day, i1_sched.arrival)
                
                # Calculate Arrival Time at Intermediate
                arrival_dt = self.get_arrival_datetime(date, s1_sched.day, i1_sched.day, i1_sched.arrival)
                
                # Minimum buffer: 1 hour, Max wait: 12 hours
                min_departure_dt = arrival_dt + timedelta(hours=1)
                max_departure_dt = arrival_dt + timedelta(hours=12)
                
                search_date_2 = min_departure_dt 
                
                # Leg 2: Inter -> Dest
                # Optimization: get_trains_between is now fast
                leg2_trains = self.dm.get_trains_between(inter, destination, search_date_2)
                
                for t2 in leg2_trains:
                     i2_sched = t2.get_schedule_for_station(inter)
                     d2_sched = t2.get_schedule_for_station(destination)
                     
                     if preferred_class != 'Any' and preferred_class not in t2.base_fares:
                        continue
                     c2 = preferred_class if preferred_class in t2.base_fares else list(t2.base_fares.keys())[0]
                     fare2 = t2.base_fares.get(c2, 0)
                     
                     parts = list(map(int, i2_sched.departure.split(':')))
                     if len(parts) == 3:
                         dep_h, dep_m, dep_s = parts
                     else:
                         dep_h, dep_m = parts
                         dep_s = 0
                     leg2_dep_dt = search_date_2.replace(hour=dep_h, minute=dep_m, second=dep_s, microsecond=0)
                     
                     if leg2_dep_dt < min_departure_dt:
                         continue
                         
                     if leg2_dep_dt > max_departure_dt:
                         continue
                         
                     dur2 = self.calculate_duration_minutes(i2_sched.day, i2_sched.departure, d2_sched.day, d2_sched.arrival)
                     
                     wait_mins = int((leg2_dep_dt - arrival_dt).total_seconds() / 60)
                     total_dur = dur1 + wait_mins + dur2
                     
                     leg1 = JourneyLeg(t1, source, inter, s1_sched.departure, i1_sched.arrival, dur1, fare1, c1, i1_sched.dist - s1_sched.dist)
                     leg2 = JourneyLeg(t2, inter, destination, i2_sched.departure, d2_sched.arrival, dur2, fare2, c2, d2_sched.dist - i2_sched.dist, wait_time_before=wait_mins)
                     
                     itin = Itinerary(
                         legs=[leg1, leg2],
                         total_fare=fare1+fare2,
                         total_duration_minutes=total_dur,
                         total_transfers=1,
                         route_type="Break Journey",
                         via=inter
                     )
                     itineraries.append(itin)
                     
        return itineraries

    def get_best_options(self, source: str, destination: str, date: datetime, preferred_class: str = 'SL') -> List[Itinerary]:
        direct = self.find_direct_routes(source, destination, date, preferred_class)
        breaks = self.find_break_journeys(source, destination, date, preferred_class)
        
        all_options = direct + breaks
        
        # Sort by Fare (asc), then Time (asc)
        all_options.sort(key=lambda x: (x.total_fare, x.total_duration_minutes))
        
        return all_options[:5]
