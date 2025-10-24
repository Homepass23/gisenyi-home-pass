'use client';

import React from 'react';
import ToggleCheck from './ToggleCheck';

interface OptionsFilterProps {
  freeCancel: boolean;
  onFreeCancelChange: (value: boolean) => void;
}

const OptionsFilter = ({ 
  freeCancel, 
  onFreeCancelChange 
}: OptionsFilterProps) => {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-lg font-medium mb-3">Options</div>
      <div className="space-y-3">
        <ToggleCheck
          label="Free cancellation"
          checked={freeCancel}
          onChange={(v: boolean) => onFreeCancelChange(v)}
        />
      </div>
    </div>
  );
};

export default OptionsFilter;