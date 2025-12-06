import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Station } from '../api';
import { FaChevronDown, FaTrain } from 'react-icons/fa';

interface StationSelectorProps {
    label: string;
    value: string; // Station code
    onChange: (code: string) => void;
    stations: Station[];
}

export const StationSelector: React.FC<StationSelectorProps> = ({ label, value, onChange, stations }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [filteredStations, setFilteredStations] = useState<Station[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Initialize search input when value changes
    useEffect(() => {
        const selected = stations.find(s => s.code === value);
        if (selected) {
            setSearch(`${selected.name} (${selected.code})`);
        }
    }, [value, stations]);

    // Handle clicking outside to close
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Reset search to selected value on close if invalid
                const selected = stations.find(s => s.code === value);
                if (selected) {
                    setSearch(`${selected.name} (${selected.code})`);
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef, value, stations]);

    // Filter logic
    useEffect(() => {
        if (!isOpen) return; // Don't filter when closed

        const q = search.toLowerCase();
        // Simple optimization: only take top 50 matches
        const matches = [];
        for (const s of stations) {
            if (s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)) {
                matches.push(s);
                if (matches.length >= 50) break;
            }
        }
        setFilteredStations(matches);
    }, [search, stations, isOpen]);

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-neo-black font-extrabold mb-2 uppercase tracking-wide text-sm">
                {label}
            </label>

            <div className="relative">
                <div
                    className="flex items-center w-full bg-white border-3 border-neo-black p-3 shadow-neo-sm focus-within:shadow-neo focus-within:ring-2 focus-within:ring-neo-pink cursor-text"
                    onClick={() => {
                        setIsOpen(true);
                        setSearch(''); // Clear on click to allow fresh type? Or keep existing?
                        // Better UX: select text or clear? Let's clear for quick typing, or just open.
                        // Actually, if I click, I might want to see the dropdown.
                        if (!isOpen) setSearch('');
                    }}
                >
                    <FaTrain className="text-neo-black mr-3 text-lg" />
                    <input
                        type="text"
                        className="w-full bg-transparent outline-none font-bold text-lg placeholder-gray-400 uppercase"
                        placeholder="Type station name or code..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => {
                            setIsOpen(true);
                            setSearch(''); // Auto clear for convenient typing? Maybe. 
                            // Let's preserve value logic: if focused, maybe selects all text?
                            // For simplicity, clearing content on focus allows immediate filtered searching.
                        }}
                    />
                    <FaChevronDown className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 w-full mt-2 bg-white border-3 border-neo-black shadow-neo-lg max-h-60 overflow-y-auto"
                        >
                            {filteredStations.length === 0 ? (
                                <div className="p-4 text-center font-bold text-gray-500">
                                    No stations found
                                </div>
                            ) : (
                                <ul>
                                    {filteredStations.map((s) => (
                                        <li
                                            key={s.code}
                                            className="px-4 py-3 hover:bg-neo-peach border-b-2 border-gray-100 last:border-0 cursor-pointer transition-colors"
                                            onClick={() => {
                                                onChange(s.code);
                                                setSearch(`${s.name} (${s.code})`);
                                                setIsOpen(false);
                                            }}
                                        >
                                            <div className="font-black text-neo-black">{s.name}</div>
                                            <div className="text-xs font-bold text-gray-500">{s.code} • {s.zone || 'Unknown Zone'}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
