'use client';

import React from 'react';

interface PriceFilterProps {
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

const PriceFilter = ({ 
  minPrice, 
  maxPrice, 
  onMinPriceChange, 
  onMaxPriceChange 
}: PriceFilterProps) => {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-lg font-medium mb-3">Price Range (Rwf)</div>
      <div className="grid grid-cols-2 gap-3">
        <input
          className="border rounded px-3 py-2 text-sm"
          placeholder="Min"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
          inputMode="numeric"
        />
        <input
          className="border rounded px-3 py-2 text-sm"
          placeholder="Max"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
          inputMode="numeric"
        />
      </div>
      <div className="text-xs text-gray-400 mt-2">
        Tip: leave blank for no limit
      </div>
    </div>
  );
};

export default PriceFilter;