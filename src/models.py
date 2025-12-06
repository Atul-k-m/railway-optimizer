from dataclasses import dataclass
from typing import List, Dict, Optional

@dataclass
class Station:
    code: str
    name: str
    zone: str

@dataclass
class ScheduleItem:
    station: str
    arrival: str
    departure: str
    day: int
    dist: int

@dataclass
class Train:
    number: str
    name: str
    days: List[str]
    classes: List[str]
    schedule: List[ScheduleItem]
    base_fares: Dict[str, int]
    
    def __hash__(self):
        return hash(self.number)

    def __eq__(self, other):
        if not isinstance(other, Train):
            return False
        return self.number == other.number

    def get_schedule_for_station(self, station_code: str) -> Optional[ScheduleItem]:
        for item in self.schedule:
            if item.station == station_code:
                return item
        return None

@dataclass
class JourneyLeg:
    train: Train
    source: str
    destination: str
    dep_time: str
    arr_time: str
    duration: int # in minutes
    fare: int
    travel_class: str
    dist: int
    wait_time_before: int = 0 # in minutes, at source of this leg

@dataclass
class Itinerary:
    legs: List[JourneyLeg]
    total_fare: int
    total_duration_minutes: int
    total_transfers: int
    route_type: str # "Direct" or "Break Journey"
    via: Optional[str] = None
    
    @property
    def total_duration_str(self) -> str:
        hours = self.total_duration_minutes // 60
        mins = self.total_duration_minutes % 60
        return f"{hours}h {mins}m"
