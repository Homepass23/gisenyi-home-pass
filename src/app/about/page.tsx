// src/app/about/page.tsx
import Image from "next/image";
import { FaUsers, FaMoneyCheckAlt, FaMapMarkedAlt, FaTools } from "react-icons/fa";
import Newsletter from "../components/newsletter";

const Accent = () => <div className="h-[2px] w-10 bg-sky-500 my-4" />;

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
            {/* Hero */}
        <section className="relative h-[32vh] md:h-[50vh] w-full overflow-hidden">
        {/* Background image */}
        <Image
            src="/images/Room2.1.jpg"                 // put your banner image here
            alt="Lake Kivu home interior"
            fill
            priority
            className="object-cover object-center scale-105"
        />

        {/* Soft white wash to match the screenshot’s faded look */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/80 via-white/40 to-white/70 md:from-white/60 md:via-white/30 md:to-white/60 backdrop-blur-[1px]" />

        {/* Title */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
            <h1 className="pt-12 text-3xl md:text-4xl font-semibold text-gray-800 tracking-wide">
                About Us
            </h1>
            <div className="mx-auto mt-3 h-[2px] w-12 bg-[#c79c61]" />
            </div>
        </div>
        </section>


      <div className="mx-auto w-full max-w-6xl px-6 md:px-8">
        {/* Section A: Our Platform (text left, image right) */}
        <section className="py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Our Platform</h2>
            <Accent />
            <p className="text-gray-600 leading-7">
              Gisenyi Home Pass makes it easy to discover and book private homes around
              Lake Kivu—built for local travelers and visiting families. Find the right
              place fast with smart filters for group size, budget, distance to the lake,
              property type, and amenities like Kitchen, Wi-Fi, Parking, or a Garden.
            </p>
            <p className="text-gray-600 leading-7 mt-6">
              Choose to reserve the <span className="font-medium">entire home</span> for your group
              or book <span className="font-medium">individual rooms</span> in the same property.
              Our interactive map highlights locations near Lake Kivu and key attractions,
              with quick picks like <em>Perfect for Groups</em>, <em>Budget-Friendly</em>, and
              <em> Lake View</em>.
            </p>
          </div>

          <div className="relative aspect-[5/3] md:aspect-[5/3]">
            <Image
              src="/images/condo.jpg"
              alt="Bright living room suited for families and groups"
              fill
              className="object-cover rounded-lg shadow-md"
            />
          </div>
        </section>

        {/* Section B: Why Gisenyi (image left, text right) */}
        <section className="py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative order-1 md:order-none aspect-[4/3] md:aspect-[5/3]">
            <Image
              src="/images/kivu.jpg"
              alt="Modern bedroom near Lake Kivu"
              fill
              className="object-cover rounded-lg shadow-md"
            />
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Why Gisenyi</h2>
            <Accent />
            <p className="text-gray-600 leading-7">
              We’re rooted in Rubavu–Gisenyi. Beyond stays, we provide a local guide to
              Lake Kivu activities, event calendars like the Kivu Beach Festival, and
              trusted tips for restaurants and services—so your trip feels effortless and
              authentic.
            </p>
            <p className="text-gray-600 leading-7 mt-6">
              Hosts share personal introductions and local advice, while our team offers
              on-ground support. Tour-operator partners are integrated for boat tours,
              water sports, and curated lake experiences you can book alongside your stay.
            </p>
          </div>
        </section>

        {/* Section C: For Guests & Hosts (text left, image right again) */}
        <section className="py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
              For Guests & Hosts
            </h2>
            <Accent />
            <p className="text-gray-600 leading-7">
              Travelers get a simple dashboard with a <span className="font-medium">Group Booking Wizard</span>,
              a <span className="font-medium">Budget Calculator</span> (often cheaper than multiple hotel rooms),
              wishlists, booking history, and easy sharing with companions.
            </p>
            <p className="text-gray-600 leading-7 mt-6">
              Hosts manage listings with an intuitive workflow—update calendars and pricing,
              receive instant booking alerts, chat with guests, and track earnings. Admin tools
              support property approval, quality control, commissions, and performance analytics.
            </p>
          </div>

          <div className="relative aspect-[4/3] md:aspect-[5/3]">
            <Image
              src="/images/booking.jpg"
              alt="Cozy lake-view bedroom"
              fill
              className="object-cover rounded-lg shadow-md"
            />
          </div>
        </section>

        {/* Features grid (like “Hotel Facilities”) */}
        <section className="py-12 md:py-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Platform Highlights
            </h3>
            <div className="mx-auto mt-3 h-[2px] w-10 bg-sky-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {/* 1 */}
            <div className="flex items-start gap-5">
              <div className="text-sky-500 text-4xl" aria-hidden>
                <FaUsers />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Group-Centric Booking</h4>
                <p className="text-gray-600 mt-2">
                  Whole-home or per-room reservations with a guided flow that keeps families and
                  groups on the same page—fast, clear, and stress-free.
                </p>
              </div>
            </div>

            {/* 2 */}
            <div className="flex items-start gap-5">
              <div className="text-sky-500 text-4xl" aria-hidden>
                <FaMoneyCheckAlt />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Local & Secure Payments</h4>
                <p className="text-gray-600 mt-2">
                  MTN/Airtel mobile money, bank transfers, and cards. Clear pricing with a simple
                  commission structure—no hidden fees.
                </p>
              </div>
            </div>

            {/* 3 */}
            <div className="flex items-start gap-5">
              <div className="text-sky-500 text-4xl" aria-hidden>
                <FaMapMarkedAlt />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Lake Kivu Focus</h4>
                <p className="text-gray-600 mt-2">
                  Smart search + interactive map near Lake Kivu and attractions. Curated local
                  experiences and tour-operator integrations.
                </p>
              </div>
            </div>

            {/* 4 */}
            <div className="flex items-start gap-5">
              <div className="text-sky-500 text-4xl" aria-hidden>
                <FaTools />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Host-Friendly Tools</h4>
                <p className="text-gray-600 mt-2">
                  Easy property setup, calendar & pricing updates, booking notifications, and
                  performance insights for local hosts.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t" />
        </section>
      </div>
      <Newsletter />
    </main>
  );
}
