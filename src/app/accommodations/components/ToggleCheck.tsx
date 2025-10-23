'use client';

import React from 'react';

interface ToggleCheckProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const ToggleCheck = ({ label, checked, onChange }: ToggleCheckProps) => {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <input
        type="checkbox"
        className="w-4 h-4"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
};

export default ToggleCheck;