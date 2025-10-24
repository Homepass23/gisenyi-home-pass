"use client";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

export default function Gallery() {
  const images = [
    "/images/side.jpg",
    "/images/side2.jpg",
    "/images/side3.jpg",
    "/images/side1.jpg",
  ]; // replace with your actual image paths

  return (
    <section className="relative bg-white text-black">
      <div className="w-full mx-auto text-start">

        {/* Swiper Slider */}
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 3000 }}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="overflow-hidden"
        >
          {images.map((src, i) => (
            <SwiperSlide key={i} className="p-1">
              <div className="relative h-[550px] overflow-hidden shadow-lg">
                <Image
                  src={src}
                  alt={`Gallery Image ${i + 1}`}
                  fill
                  className="object-cover transform hover:scale-105 transition duration-500"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
