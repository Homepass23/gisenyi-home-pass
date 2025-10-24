'use client';

import React from 'react';

interface GuestFilterProps {
  maxGuests: number | null;
  onMaxGuestsChange: (value: number | null) => void;
}

const GuestFilter = ({ 
  maxGuests, 
  onMaxGuestsChange 
}: GuestFilterProps) => {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-lg font-medium mb-3">Guests</div>
      <select
        value={maxGuests || ""}
        onChange={(e) => onMaxGuestsChange(e.target.value ? parseInt(e.target.value) : null)}
        className="w-full border rounded px-3 py-2 text-sm"
      >
        <option value="">Any number of guests</option>
        <option value="1">1 Guest</option>
        <option value="2">2 Guests</option>
        <option value="3">3 Guests</option>
        <option value="4">4 Guests</option>
        <option value="5">5+ Guests</option>
      </select>
    </div>
  );
};

export default GuestFilter;