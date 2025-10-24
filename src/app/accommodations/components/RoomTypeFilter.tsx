'use client';

import React from 'react';

interface RoomTypeFilterProps {
  roomType: 'house' | 'room' | null;
  onRoomTypeChange: (value: 'house' | 'room' | null) => void;
}

const RoomTypeFilter = ({ roomType, onRoomTypeChange }: RoomTypeFilterProps) => {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-lg font-medium mb-3">Accommodation Type</div>
      <div className="space-y-2">
        {(['house', 'room'] as const).map((t) => (
          <label
            key={t}
            className="flex items-center gap-3 py-1 cursor-pointer"
          >
            <input
              type="radio"
              name="roomType"
              className="w-4 h-4"
              checked={roomType === t}
              onChange={() => onRoomTypeChange(t)}
            />
            <span className="text-sm text-gray-700">
              {t === 'house' ? 'Entire House' : 'Room'}
            </span>
          </label>
        ))}
        <button
          className="mt-2 text-xs text-gray-500 hover:underline"
          onClick={() => onRoomTypeChange(null)}
        >
          Reset accommodation type
        </button>
      </div>
    </div>
  );
};

export default RoomTypeFilter;