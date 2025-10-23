'use client';

import React from 'react';
import PropertyCard from './PropertyCard';
import { QueryAccommodation } from '../../../lib/queryHelpers';

interface PropertyListProps {
  properties: QueryAccommodation[];
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

const PropertyList = ({ 
  properties, 
  isFetchingNextPage, 
  hasNextPage, 
  scrollRef 
}: PropertyListProps) => {
  return (
    <div className="space-y-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
      
      {/* Infinite scroll trigger */}
      <div ref={scrollRef} className="py-4 text-center">
        {isFetchingNextPage ? (
          <p>Loading more accommodations...</p>
        ) : hasNextPage ? (
          <p>Scroll to load more</p>
        ) : (
          <p>No more accommodations to load</p>
        )}
      </div>
    </div>
  );
};

export default PropertyList;