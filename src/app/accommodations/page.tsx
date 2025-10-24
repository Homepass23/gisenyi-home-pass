"use client";

import { Suspense } from "react";
import AccommodationsPage from "./components/AccommodationsPage";

export default function AccommodationsListing() {
  return (
    <Suspense fallback={
      <div className="w-full mt-21 py-20 text-center">
        Loading accommodations...
      </div>
    }>
      <AccommodationsPage />
    </Suspense>
  );
}
