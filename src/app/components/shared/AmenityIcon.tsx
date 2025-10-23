'use client';

import React from 'react';
import { 
  Wifi, 
  Coffee, 
  Tv, 
  Utensils, 
  Bath, 
  Car, 
  Snowflake, 
  User 
} from 'lucide-react';

interface AmenityIconProps {
  name: string;
}

const AmenityIcon = ({ name }: AmenityIconProps) => {
  const base =
    "border border-dashed border-gray-200 px-2 py-1.5 rounded flex items-center justify-center text-gray-500 text-xs gap-1";

  switch (name) {
    case "wifi":
      return (
        <div className={base} title="Wi-Fi">
          <Wifi className="w-4 h-4" />
          <span>Wi-Fi</span>
        </div>
      );
    case "coffee":
      return (
        <div className={base} title="Coffee">
          <Coffee className="w-4 h-4" />
          <span>Coffee</span>
        </div>
      );
    case "cutlery":
      return (
        <div className={base} title="Restaurant">
          <Utensils className="w-4 h-4" />
          <span>Restaurant</span>
        </div>
      );
    case "tv":
      return (
        <div className={base} title="TV">
          <Tv className="w-4 h-4" />
          <span>TV</span>
        </div>
      );
    case "breakfast":
      return (
        <div className={base} title="Breakfast">
          <Coffee className="w-4 h-4" />
          <span>Breakfast</span>
        </div>
      );
    case "ac":
      return (
        <div className={base} title="A/C">
          <Snowflake className="w-4 h-4" />
          <span>A/C</span>
        </div>
      );
    case "parking":
      return (
        <div className={base} title="Parking">
          <Car className="w-4 h-4" />
          <span>Parking</span>
        </div>
      );
    case "shower":
      return (
        <div className={base} title="Shower">
          <Bath className="w-4 h-4" />
          <span>Shower</span>
        </div>
      );
    case "spa":
      return (
        <div className={base} title="Spa">
          <Bath className="w-4 h-4" />
          <span>Spa</span>
        </div>
      );
    case "jacuzzi":
      return (
        <div className={base} title="Jacuzzi">
          <Bath className="w-4 h-4" />
          <span>Jacuzzi</span>
        </div>
      );
    case "butler":
      return (
        <div className={base} title="Butler Service">
          <User className="w-4 h-4" />
          <span>Butler</span>
        </div>
      );
    default:
      return <div className={base} title={name}>{name}</div>;
  }
};

export default AmenityIcon;