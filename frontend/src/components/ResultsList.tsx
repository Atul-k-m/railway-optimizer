import React from 'react';
import {type Option } from '../api';

interface ResultsListProps {
    options: Option[];
}

export const ResultsList: React.FC<ResultsListProps> = ({ options }) => {
    if (options.length === 0) return null;

    return (
        <div className="mt-16 space-y-10">
            <div className="text-center md:text-left">
                <h3 className="text-3xl font-black bg-neo-white border-3 border-neo-black inline-block px-6 py-2 shadow-neo-sm transform -rotate-1 text-neo-black">
                    AVAILABLE OPTIONS ({options.length})
                </h3>
            </div>

            {options.map((opt, idx) => (
                <div key={idx} className="bg-white border-3 border-neo-black p-0 shadow-neo-lg hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_#FF69B4] transition-all duration-300">
                    {/* Header */}
                    <div className="bg-neo-peach-dark p-6 border-b-3 border-neo-black flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 text-sm font-bold border-2 border-neo-black shadow-[2px_2px_0px_0px_#000] ${opt.transfers === 0 ? 'bg-green-400 text-black' : 'bg-neo-yellow text-black'}`}>
                                    {opt.route_type.toUpperCase()}
                                </span>
                                {opt.via && (
                                    <span className="text-sm font-bold bg-white px-2 border-2 border-neo-black shadow-[2px_2px_0px_0px_#000]">
                                        Via {opt.via}
                                    </span>
                                )}
                            </div>
                            <div className="text-4xl font-black text-neo-black mt-2">
                                ₹{opt.total_fare}
                            </div>
                        </div>
                        <div className="text-right mt-4 md:mt-0 bg-white p-2 border-2 border-neo-black shadow-neo-sm">
                            <div className="text-2xl font-black">{opt.total_duration_str}</div>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Duration</div>
                        </div>
                    </div>

                    {/* Legs */}
                    <div className="p-6 bg-neo-white space-y-6">
                        {opt.legs.map((leg, i) => (
                            <div key={i} className="relative pl-8 border-l-4 border-black ml-2">
                                {/* Dot on timeline */}
                                <div className="absolute -left-[11px] top-0 w-4 h-4 bg-neo-pink border-3 border-black rounded-full"></div>

                                {leg.wait_time_before > 0 && (
                                    <div className="mb-4 bg-neo-yellow p-2 border-2 border-black border-dashed inline-block text-sm font-bold shadow-neo-sm transform rotate-1">
                                        ⏳ Layover: {Math.floor(leg.wait_time_before / 60)}h {leg.wait_time_before % 60}m at {leg.source}
                                    </div>
                                )}

                                <div className="bg-white border-2 border-neo-black p-4 shadow-sm group hover:shadow-neo-sm transition-shadow">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
                                        <div className="font-black text-lg text-neo-pink-deep">{leg.train_number} - {leg.train_name}</div>
                                        <div className="font-bold bg-neo-cyan px-2 py-1 border-2 border-black text-sm">₹{leg.fare}</div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm md:text-base">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-500 text-xs">DEPART</span>
                                            <span className="font-black text-xl">{leg.dep_time}</span>
                                            <span className="font-bold">{leg.source}</span>
                                        </div>
                                        <div className="text-2xl text-neo-pink px-4">➜</div>
                                        <div className="flex flex-col text-right">
                                            <span className="font-bold text-gray-500 text-xs">ARRIVE</span>
                                            <span className="font-black text-xl">{leg.arr_time}</span>
                                            <span className="font-bold">{leg.destination}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
