export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Station {
    code: string;
    name: string;
}

export interface SearchParams {
    source: string;
    destination: string;
    date: string; // DD-MM-YYYY
    pclass: string;
}

export interface Leg {
    train_name: string;
    train_number: string;
    source: string;
    destination: string;
    dep_time: string;
    arr_time: string;
    duration: number;
    fare: number;
    wait_time_before: number;
}

export interface Option {
    total_fare: number;
    total_duration: number;
    total_duration_str: string;
    transfers: number;
    via?: string;
    route_type: string;
    legs: Leg[];
}

export interface SearchResponse {
    source: string;
    destination: string;
    date: string;
    options: Option[];
}

export async function fetchStations(): Promise<Station[]> {
    const response = await fetch(`${API_BASE_URL}/api/stations`);
    if (!response.ok) {
        throw new Error('Failed to fetch stations');
    }
    return response.json();
}

export async function searchTrains(params: SearchParams): Promise<SearchResponse> {
    const query = new URLSearchParams({
        source: params.source,
        destination: params.destination,
        date: params.date,
        pclass: params.pclass
    });

    const response = await fetch(`${API_BASE_URL}/api/search?${query.toString()}`);
    if (!response.ok) {
        try {
            // Try to parse detailed error
            const err = await response.json();
            throw new Error(err.detail || 'Search failed');
        } catch (e) {
            throw new Error('Failed to search trains');
        }
    }
    return response.json();
}
