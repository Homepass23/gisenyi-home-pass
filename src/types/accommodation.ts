export type Accomodation = {
  id: string;
  title: string;
  maxGuests?: number;
  beds?: number;
  baths?: number;
  toilets?: number;
  pricePerNight: number;
  description: string;
  Images: string[];
  amenities?: string[];
  rating?: number;
  type?: "Entire house" | "Room"
  freeCancel?: boolean;
  location?: string; // Add location field
};