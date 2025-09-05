import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import HeaderNav from './components/HeaderNav'
import React from "react";
import Footer from "./components/footer";

const lato = Lato({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "700"], // You can include other weights if you want
});

export const metadata: Metadata = {
  title: "Gisenyi Home Pass",
  description: "Discover your perfect homestay in Gisenyi, Rwanda. Experience comfort, culture, and community with us.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lato.variable} antialiased`}
      >
        <HeaderNav />
        {children}
        <Footer />
        {/* Add any global scripts or components here */}
      </body>
    </html>
  );
}
