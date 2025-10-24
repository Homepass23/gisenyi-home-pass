'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface RatingFilterProps {
  rating: number | null;
  onRatingChange: (value: number | null) => void;
}

const RatingFilter = ({ rating, onRatingChange }: RatingFilterProps) => {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-lg font-medium mb-3">Minimum Rating</div>
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((r) => (
          <label
            key={r}
            className="flex items-center gap-3 py-1 cursor-pointer"
          >
            <input
              type="radio"
              name="rating"
              className="w-4 h-4"
              checked={rating === r}
              onChange={() => onRatingChange(r)}
            />
            <span className="text-sm text-gray-700 flex items-center gap-1">
              {Array.from({ length: r }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 text-yellow-500 fill-yellow-500"
                />
              ))}
              <span className="text-gray-500"> & up</span>
            </span>
          </label>
        ))}
        <button
          className="mt-2 text-xs text-gray-500 hover:underline"
          onClick={() => onRatingChange(null)}
        >
          Reset rating
        </button>
      </div>
    </div>
  );
};

export default RatingFilter;