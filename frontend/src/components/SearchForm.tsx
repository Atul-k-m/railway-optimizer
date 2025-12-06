import React, { useState, useEffect } from 'react';
import { type SearchParams, type Station, fetchStations } from '../api';
import { FaSearch } from 'react-icons/fa';
import { StationSelector } from './StationSelector';
import { FunkyCalendar } from './FunkyCalendar';

interface SearchFormProps {
    onSearch: (params: SearchParams) => void;
    isLoading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('07-12-2025'); // Default date for demo
    const [pclass, setPclass] = useState('SL');
    const [stations, setStations] = useState<Station[]>([]);

    useEffect(() => {
        const loadStations = async () => {
            try {
                const data = await fetchStations();
                setStations(data);
            } catch (error) {
                console.error("Failed to load stations", error);
            }
        };
        loadStations();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({ source, destination, date, pclass });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-neo-white border-4 border-neo-black p-6 md:p-8 shadow-neo-lg max-w-4xl mx-auto transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            <h2 className="text-3xl font-black mb-8 text-center text-neo-black uppercase tracking-tighter">
                Plan Your <span className="text-neo-pink underline decoration-4 decoration-neo-black">Great Escape</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <StationSelector
                    label="From"
                    value={source}
                    onChange={setSource}
                    stations={stations}
                />

                <StationSelector
                    label="To"
                    value={destination}
                    onChange={setDestination}
                    stations={stations}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <FunkyCalendar value={date} onChange={setDate} />

                <div className="relative">
                    <label className="block text-neo-black font-extrabold mb-2 uppercase tracking-wide text-sm">
                        Preferred Class
                    </label>
                    <div className="relative">
                        <select
                            className="block w-full bg-white border-3 border-neo-black text-neo-black py-3 px-4 pr-8 shadow-neo-sm focus:shadow-neo focus:ring-0 appearance-none font-bold text-lg"
                            value={pclass}
                            onChange={(e) => setPclass(e.target.value)}
                        >
                            <option value="SL">Sleeper (SL)</option>
                            <option value="3A">3rd AC (3A)</option>
                            <option value="2A">2nd AC (2A)</option>
                            <option value="1A">1st AC (1A)</option>
                            <option value="CC">Chair Car (CC)</option>
                            <option value="2S">Second Sitting (2S)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neo-black">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-neo-black text-neo-white font-black py-4 px-8 border-none shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all duration-200 flex items-center justify-center uppercase tracking-widest text-xl group"
            >
                {isLoading ? (
                    'Searching...'
                ) : (
                    <>
                        Search Trains <FaSearch className="ml-3 group-hover:rotate-12 transition-transform" />
                    </>
                )}
            </button>
        </form>
    );
};
