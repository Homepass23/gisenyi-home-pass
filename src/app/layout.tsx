import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "../context/AuthContext";
import HeaderNav from "./components/layout/HeaderNav";
import Footer from "./components/layout/footer";
import ReactQueryProvider from "./providers/ReactQueryProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gisenyi Home Pass",
  description: "Find your perfect accommodation in Gisenyi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          <AuthProvider>
            <HeaderNav />
            {children}
            <Footer />
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}