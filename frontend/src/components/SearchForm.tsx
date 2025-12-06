import React, { useState, useEffect } from 'react';
import { type Station, fetchStations, type SearchParams } from '../api';

interface SearchFormProps {
    onSearch: (params: SearchParams) => void;
    loading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, loading }) => {
    const [stations, setStations] = useState<Station[]>([]);
    const [source, setSource] = useState('SBC');
    const [destination, setDestination] = useState('VSG');
    const [date, setDate] = useState(() => {
        const today = new Date();
        return `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
    });
    const [pclass, setPclass] = useState('SL');

    useEffect(() => {
        fetchStations().then(setStations).catch(console.error);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch({ source, destination, date, pclass });
    };

    const inputClass = "w-full bg-white border-3 border-neo-black p-3 shadow-neo-sm focus:shadow-neo focus:outline-none focus:ring-2 focus:ring-neo-pink font-bold text-lg mb-4 placeholder-gray-400";
    const labelClass = "block text-neo-black font-extrabold mb-2 uppercase tracking-wide text-sm";

    return (
        <form onSubmit={handleSubmit} className="bg-neo-pink-light border-3 border-neo-black shadow-neo-lg p-8 transform rotate-1 relative overflow-hidden">
            {/* Decorative circle */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-neo-yellow rounded-full border-3 border-neo-black z-0 opacity-50"></div>

            <div className="relative z-10">
                <h2 className="text-3xl font-black mb-8 bg-neo-white inline-block px-4 py-1 border-3 border-neo-black transform -rotate-1 shadow-neo-sm text-neo-pink-deep">
                    start your journey
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>From Station</label>
                        <select
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className={inputClass}
                        >
                            {stations.map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>To Station</label>
                        <select
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            className={inputClass}
                        >
                            {stations.map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    <div>
                        <label className={labelClass}>Travel Date</label>
                        <input
                            type="text"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            placeholder="DD-MM-YYYY"
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Preferred Class</label>
                        <select
                            value={pclass}
                            onChange={(e) => setPclass(e.target.value)}
                            className={inputClass}
                        >
                            <option value="SL">Sleeper (SL)</option>
                            <option value="3A">AC 3 Tier (3A)</option>
                            <option value="2A">AC 2 Tier (2A)</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-neo-black text-neo-white text-xl font-black border-3 border-neo-black p-4 mt-6 shadow-neo hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-neo-pink-deep transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? "SEARCHING..." : "SEARCH TRAINS ➜"}
                </button>
            </div>
        </form>
    );
};
