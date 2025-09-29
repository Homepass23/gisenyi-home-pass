"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Wifi,
  Coffee,
  Star,
  Settings,
  Users,
  Box,
} from "lucide-react";

import { Accomodation } from "../types/accommodation";


const SAMPLE_ROOMS: Accomodation[] = [
  {
    id: "r1",
    title: "Deluxe Room",
    pricePerNight: 199,
    description:
      "Spacious room with city view, comfortable king bed and modern amenities.",
    Images: ["/images/Room1.jpg"],
    amenities: ["wifi", "coffee", "tv", "cutlery", "parking", "ac"],
    rating: 4.6,
    type: "Room",
    instant: true,
    freeCancel: true,
  },
  {
    id: "r2",
    title: "Single Room",
    pricePerNight: 210,
    description: "Cozy single room ideal for solo travelers.",
    Images: ["/images/Room2.jpg"],
    amenities: ["wifi", "shower", "cutlery", "breakfast"],
    rating: 4.2,
    type: "Room",
    instant: false,
    freeCancel: true,
  },
  {
    id: "r3",
    title: "Family Entire house",
    pricePerNight: 289,
    description: "Large Entire house with sleeping area and living space for families.",
    Images: ["/images/Room.jpg"],
    amenities: ["wifi", "tv", "coffee", "cutlery", "ac", "breakfast"],
    rating: 4.8,
    type: "Room",
    instant: true,
    freeCancel: false,
  },
  {
    id: "r4",
    title: "Economy Room",
    pricePerNight: 129,
    description: "Smart, budget-friendly room with essential comforts.",
    Images: ["/images/bedroom.jpg"],
    maxGuests: 2,
    amenities: ["wifi"],
    rating: 3.9,
    type: "Room",
    instant: false,
    freeCancel: false,
  },
  {
    id: "r5",
    title: "Executive Entire house",
    pricePerNight: 350,
    description:
      "Luxurious Entire house with private lounge and premium services for executives.",
    Images: ["/images/condo.jpg"],
    amenities: ["wifi", "tv", "coffee", "cutlery", "ac", "parking", "spa"],
    rating: 4.9,
    type: "Entire house",
    instant: true,
    freeCancel: true,
  },
  {
    id: "r6",
    title: "Twin Room",
    pricePerNight: 180,
    description: "Comfortable twin beds, perfect for friends or colleagues.",
    Images: ["/images/cozy.jpg"],
    amenities: ["wifi", "tv", "shower", "breakfast"],
    rating: 4.3,
    type: "Room",
    instant: true,
    freeCancel: true,
  },
  {
    id: "r7",
    title: "Honeymoon Entire house",
    pricePerNight: 399,
    description: "Romantic Entire house with elegant décor and jacuzzi.",
    Images: ["/images/interior.jpg"],
    amenities: ["wifi", "tv", "spa", "jacuzzi", "breakfast"],
    rating: 4.9,
    type: "Entire house",
    instant: true,
    freeCancel: false,
  },
  
  {
    id: "r9",
    title: "Presidential Entire house",
    pricePerNight: 599,
    description: "Ultimate luxury experience with private dining and butler service.",
    Images: ["/images/inzu.jpg"],
    amenities: [
      "wifi",
      "tv",
      "coffee",
      "cutlery",
      "ac",
      "spa",
      "jacuzzi",
      "butler",
    ],
    rating: 5.0,
    type: "Entire house",
    instant: true,
    freeCancel: false,
  },
];


export default function AccommodationsListing() {
  const [queryRooms] = useState(SAMPLE_ROOMS);

  // Sidebar UI state (UI-only for now; hook up to filtering later if needed)
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [amenities, setAmenities] = useState<Record<string, boolean>>({
    wifi: true,
    coffee: false,
    tv: false,
    cutlery: false,
    breakfast: false,
    ac: false,
    parking: false,
  });
  const [roomType, setRoomType] = useState<
    Array<'Entire house' | 'Room'>
  >([]);
  const [rating, setRating] = useState<number | null>(null);
  const [instant, setInstant] = useState<boolean>(false);
  const [freeCancel, setFreeCancel] = useState<boolean>(false);

  const clearSidebar = () => {
    setMinPrice("");
    setMaxPrice("");
    setAmenities({
      wifi: true,
      coffee: false,
      tv: false,
      cutlery: false,
      breakfast: false,
      ac: false,
      parking: false,
    });
    setRoomType([]);
    setRating(null);
    setInstant(false);
    setFreeCancel(false);
  };

  return (
    <div className="w-full mt-21">
      {/* Top stepper */}
      <div className="bg-slate-100 mt-6 pt-10 pb-20">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="relative">
            <div className="h-1 bg-gray-200 rounded-full"></div>

            <div className="absolute py-7 inset-0 flex items-center justify-between px-6">
              {/* Step: Search (active) */}
              <StepperItem
                label="Search"
                desc="Choose your favorite room"
                active
              />
              <StepperItem label="Booking" desc="Enter your booking details" />
              <StepperItem
                label="Checkout"
                desc="Use your preferred payment method"
              />
              <StepperItem
                label="Confirmation"
                desc="Receive a confirmation email"
              />
            </div>
          </div>
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-12 gap-6">
        {/* ======= Left Sidebar - Booking + (ADDED) Filters ======= */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-xl font-semibold">Booking Details</div>
              <button
                onClick={clearSidebar}
                className="text-sm text-gray-500 hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="bg-white border rounded p-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Check In/Out
              </label>
              <input
                className="w-full border border-gray-200 rounded px-3 py-3 text-gray-500"
                placeholder="Check In  →  Check Out"
              />

              <label className="block text-sm font-medium text-gray-600 mt-4 mb-2">
                Guests
              </label>
              <input
                className="w-full border border-gray-200 rounded px-3 py-3 text-gray-500"
                placeholder="Guests 1"
              />
            </div>

            {/* Location */}
            <SidebarSection title="Location">
              <CheckboxRow label="Mumujyi" sub="Main site" />
              <CheckboxRow label="Majengo" sub="Nearby" />
              <CheckboxRow label="Mbugangali" sub="Outpost" />
            </SidebarSection>

            {/* Price Range (added) */}
            <SidebarSection title="Price Range (Rwf)">
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="border rounded px-3 py-2 text-sm"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  inputMode="numeric"
                />
                <input
                  className="border rounded px-3 py-2 text-sm"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  inputMode="numeric"
                />
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Tip: leave blank for no limit
              </div>
            </SidebarSection>

            {/* Amenities (added) */}
            <SidebarSection title="Amenities">
              <ToggleCheck
                label="Wi-Fi"
                checked={amenities.wifi}
                onChange={(v) => setAmenities((s) => ({ ...s, wifi: v }))}
              />
              <ToggleCheck
                label="Coffee / Tea"
                checked={amenities.coffee}
                onChange={(v) => setAmenities((s) => ({ ...s, coffee: v }))}
              />
              <ToggleCheck
                label="TV"
                checked={amenities.tv}
                onChange={(v) => setAmenities((s) => ({ ...s, tv: v }))}
              />
              <ToggleCheck
                label="Restaurant / Cutlery"
                checked={amenities.cutlery}
                onChange={(v) => setAmenities((s) => ({ ...s, cutlery: v }))}
              />
              <ToggleCheck
                label="Breakfast"
                checked={amenities.breakfast}
                onChange={(v) =>
                  setAmenities((s) => ({ ...s, breakfast: v }))
                }
              />
              <ToggleCheck
                label="A/C"
                checked={amenities.ac}
                onChange={(v) => setAmenities((s) => ({ ...s, ac: v }))}
              />
              <ToggleCheck
                label="Parking"
                checked={amenities.parking}
                onChange={(v) => setAmenities((s) => ({ ...s, parking: v }))}
              />
            </SidebarSection>

            {/* Room Type (added) */}
            <SidebarSection title="Room Type">
              {(['Entire house', 'Room'] as const).map(
                (t) => (
                  <label
                    key={t}
                    className="flex items-center gap-3 py-1 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={roomType.includes(t)}
                      onChange={(e) =>
                        setRoomType((prev) =>
                          e.target.checked
                            ? [...prev, t]
                            : prev.filter((x) => x !== t)
                        )
                      }
                    />
                    <span className="text-sm text-gray-700">{t}</span>
                  </label>
                )
              )}
            </SidebarSection>

            {/* Rating (added) */}
            <SidebarSection title="Minimum Rating">
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
                    onChange={() => setRating(r)}
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
                onClick={() => setRating(null)}
              >
                Reset rating
              </button>
            </SidebarSection>

            {/* Toggles (added) */}
            <SidebarSection title="Options">
              <ToggleCheck
                label="Instant booking"
                checked={instant}
                onChange={setInstant}
              />
              <ToggleCheck
                label="Free cancellation"
                checked={freeCancel}
                onChange={setFreeCancel}
              />
            </SidebarSection>

            <div className="text-sm text-gray-400">
              Filter and refine your search to find the best match.
            </div>
          </div>
        </aside>

        {/* ======= Right Listing ======= */}
        <div className="col-span-12 lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              You found {queryRooms.length} rooms from Rwf29
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select className="border border-gray-200 rounded px-3 py-2 text-sm">
                <option>Default</option>
                <option>Price low to high</option>
                <option>Price high to low</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {queryRooms.map((room) => (
              <article
                key={room.id}
                className="bg-white border rounded-lg shadow-sm overflow-hidden"
              >
                <div className="grid grid-cols-12">
                  {/* gallery */}
                  <div className="col-span-12 md:col-span-5 relative">
                    <div className="relative h-48 md:h-40 lg:h-44">
                      <Image
                        src={room.Images[0]}
                        alt={room.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="col-span-12 md:col-span-5 p-5">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-semibold">{room.title}</h3>
                      {room.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-gray-600">
                            {room.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-500 mt-3 text-sm leading-relaxed">
                      {room.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {/* amenity chips from data */}
                      {(room.amenities ?? []).map((a) => (
                        <AmenityIcon key={a} name={a} />
                      ))}
                    </div>
                  </div>

                  {/* Price / Actions */}
                  <div className="col-span-12 md:col-span-2 border-l p-5 flex flex-col justify-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-800 text-right">
                        Rwf
                        {room.pricePerNight}
                      </div>
                      <div className="text-xs text-gray-400 text-center uppercase mt-1">
                        per night
                      </div>
                    </div>

                    <div className="mt-4">
                      <button className="w-full bg-sky-700 border border-gray-200 text-white py-2 rounded text-sm">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StepperItem({
  label,
  desc,
  active = false,
}: {
  label: string;
  desc?: string;
  active?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center w-1/4">
      <div
        className={`w-6 h-6 rounded-full ${
          active ? "bg-white border border-yellow-400" : "bg-gray-100"
        } flex items-center justify-center shadow-sm`}
      >
        {active ? (
          <Settings className="w-3 h-3 text-yellow-500" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-gray-200" />
        )}
      </div>
      <div
        className={`mt-3 text-sm ${
          active ? "text-gray-800 font-medium" : "text-gray-400"
        }`}
      >
        {label}
      </div>
      {desc && <div className="text-xs text-gray-300 mt-1">{desc}</div>}
    </div>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded p-4">
      <div className="text-lg font-medium mb-3">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function CheckboxRow({ label, sub }: { label: string; sub?: string }) {
  return (
    <label className="flex items-center justify-between border rounded p-3">
      <div className="flex items-center space-x-3">
        <input type="checkbox" className="w-4 h-4" />
        <div>
          <div className="font-medium">{label}</div>
          {sub && <div className="text-xs text-gray-400">{sub}</div>}
        </div>
      </div>
      <button className="text-gray-400">?</button>
    </label>
  );
}

function ToggleCheck({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
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
}

function AmenityIcon({ name }: { name: string }) {
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
          <Box className="w-4 h-4" />
          <span>Restaurant</span>
        </div>
      );
    case "tv":
      return (
        <div className={base} title="TV">
          <Users className="w-4 h-4" />
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
          <span className="font-semibold">A/C</span>
        </div>
      );
    case "parking":
      return (
        <div className={base} title="Parking">
          <span className="font-semibold">P</span>
          <span>Parking</span>
        </div>
      );
    default:
      return <div className={base} />;
  }
}
