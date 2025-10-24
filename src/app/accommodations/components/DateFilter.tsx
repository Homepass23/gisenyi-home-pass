'use client';

import React from 'react';

interface DateFilterProps {
  checkInDate: string;
  checkOutDate: string;
  onCheckInDateChange: (value: string) => void;
  onCheckOutDateChange: (value: string) => void;
}

const DateFilter = ({ 
  checkInDate, 
  checkOutDate, 
  onCheckInDateChange, 
  onCheckOutDateChange 
}: DateFilterProps) => {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-lg font-medium mb-3">Dates</div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Check In</label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => onCheckInDateChange(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Check Out</label>
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => onCheckOutDateChange(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default DateFilter;