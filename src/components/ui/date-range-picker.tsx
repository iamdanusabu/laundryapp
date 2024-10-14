import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

type DateRange = {
  from: Date;
  to: Date;
};

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (newDateRange: DateRange) => void;
}

export function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFrom = new Date(e.target.value);
    onDateRangeChange({ ...dateRange, from: newFrom });
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTo = new Date(e.target.value);
    onDateRangeChange({ ...dateRange, to: newTo });
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Calendar className="mr-2 h-4 w-4" />
        {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
      </button>
      {isOpen && (
        <div className="absolute mt-2 p-4 bg-white border rounded-md shadow-lg z-10">
          <div className="flex flex-col space-y-2">
            <label className="flex items-center">
              <span className="mr-2">From:</span>
              <input
                type="date"
                value={formatDate(dateRange.from)}
                onChange={handleFromDateChange}
                className="border rounded-md p-1"
              />
            </label>
            <label className="flex items-center">
              <span className="mr-2">To:</span>
              <input
                type="date"
                value={formatDate(dateRange.to)}
                onChange={handleToDateChange}
                className="border rounded-md p-1"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}