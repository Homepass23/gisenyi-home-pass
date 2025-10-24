'use client';

import React from 'react';

interface SortControlProps {
  sortBy: string;
  onSortChange: (value: string) => void;
}

const SortControl = ({ sortBy, onSortChange }: SortControlProps) => {
  return (
    <div className="flex items-center space-x-4">
      <label className="text-sm text-gray-600">Sort by:</label>
      <select 
        className="border border-gray-200 rounded px-3 py-2 text-sm"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="default">Default</option>
        <option value="price_low">Price low to high</option>
        <option value="price_high">Price high to low</option>
        <option value="rating">Highest rated</option>
      </select>
    </div>
  );
};

export default SortControl;