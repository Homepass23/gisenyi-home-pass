'use client';

import React from 'react';
import ToggleCheck from './ToggleCheck';

interface AmenitiesFilterProps {
  amenities: Record<string, boolean>;
  onAmenitiesChange: (value: Record<string, boolean>) => void;
}

const AmenitiesFilter = ({ amenities, onAmenitiesChange }: AmenitiesFilterProps) => {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-lg font-medium mb-3">Amenities</div>
      <div className="space-y-3">
        <ToggleCheck
          label="Wi-Fi"
          checked={amenities.wifi}
          onChange={(v: boolean) => onAmenitiesChange({ ...amenities, wifi: v })}
        />
        <ToggleCheck
          label="Coffee / Tea"
          checked={amenities.coffee}
          onChange={(v: boolean) => onAmenitiesChange({ ...amenities, coffee: v })}
        />
        <ToggleCheck
          label="TV"
          checked={amenities.tv}
          onChange={(v: boolean) => onAmenitiesChange({ ...amenities, tv: v })}
        />
        <ToggleCheck
          label="Restaurant / Cutlery"
          checked={amenities.cutlery}
          onChange={(v: boolean) => onAmenitiesChange({ ...amenities, cutlery: v })}
        />
        <ToggleCheck
          label="Breakfast"
          checked={amenities.breakfast}
          onChange={(v: boolean) => onAmenitiesChange({ ...amenities, breakfast: v })}
        />
        <ToggleCheck
          label="A/C"
          checked={amenities.ac}
          onChange={(v: boolean) => onAmenitiesChange({ ...amenities, ac: v })}
        />
        <ToggleCheck
          label="Parking"
          checked={amenities.parking}
          onChange={(v: boolean) => onAmenitiesChange({ ...amenities, parking: v })}
        />
      </div>
    </div>
  );
};

export default AmenitiesFilter;