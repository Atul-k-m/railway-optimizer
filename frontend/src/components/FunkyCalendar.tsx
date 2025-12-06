import React, { useState } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface FunkyCalendarProps {
    value: string; // DD-MM-YYYY
    onChange: (date: string) => void;
}

export const FunkyCalendar: React.FC<FunkyCalendarProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Parse initial value or default to today
    const parseDate = (dateStr: string) => {
        const [d, m, y] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    const [currentMonth, setCurrentMonth] = useState(new Date());
    const selectedDate = parseDate(value);

    // Generate days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const handleDateClick = (day: Date) => {
        const formatted = format(day, 'dd-MM-yyyy');
        onChange(formatted);
        setIsOpen(false);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <div className="relative">
            <label className="block text-neo-black font-extrabold mb-2 uppercase tracking-wide text-sm">
                Travel Date
            </label>

            <div
                className="flex items-center bg-white border-3 border-neo-black p-3 shadow-neo-sm hover:shadow-neo cursor-pointer transition-shadow"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FaCalendarAlt className="text-neo-pink mr-3 text-lg" />
                <span className="font-black text-lg text-neo-black flex-grow">
                    {value || "Select Date"}
                </span>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.9, rotate: -2 }}
                        className="absolute z-50 mt-4 bg-neo-white border-3 border-neo-black shadow-neo-lg p-4 w-72 md:w-80 left-0"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-4 bg-neo-black text-neo-white p-2 border-2 border-neo-black shadow-neo-sm">
                            <button onClick={(e) => { e.stopPropagation(); prevMonth(); }} className="p-1 hover:text-neo-pink">
                                <FaChevronLeft />
                            </button>
                            <span className="font-black uppercase tracking-wider">
                                {format(currentMonth, 'MMMM yyyy')}
                            </span>
                            <button onClick={(e) => { e.stopPropagation(); nextMonth(); }} className="p-1 hover:text-neo-pink">
                                <FaChevronRight />
                            </button>
                        </div>

                        {/* Days Header */}
                        <div className="grid grid-cols-7 mb-2 text-center">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <div key={d} className="font-bold text-xs text-gray-500">{d}</div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((day) => {
                                const isSelected = isSameDay(day, selectedDate);
                                const isCurrentMonth = isSameMonth(day, monthStart);
                                const isTodayDate = isToday(day);

                                return (
                                    <div
                                        key={day.toString()}
                                        onClick={(e) => { e.stopPropagation(); handleDateClick(day); }}
                                        className={`
                                            p-2 text-center font-bold text-sm cursor-pointer border-2 transition-all
                                            ${!isCurrentMonth ? 'text-gray-300 border-transparent' : 'text-neo-black border-transparent'}
                                            ${isSelected ? 'bg-neo-pink text-white border-neo-black shadow-neo-sm transform -translate-y-1' : 'hover:bg-neo-peach hover:border-neo-black'}
                                            ${isTodayDate && !isSelected ? 'text-neo-pink-deep border-neo-pink-deep border-dashed' : ''}
                                        `}
                                    >
                                        {format(day, dateFormat)}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
