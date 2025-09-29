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
  instant?: boolean;
  freeCancel?: boolean;
};