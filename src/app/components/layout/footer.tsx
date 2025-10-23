'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaPhoneAlt,
  FaEnvelope,
  FaHome,
} from 'react-icons/fa'

export default function Footer() {
  const links = ['Property on sale', 'About Us', 'Our Team', 'Terms of use', 'Privacy Policy']

  const instagramImages = [
    '/images/Room2.jpg',
    '/images/Room1.jpg',
    '/images/Room.jpg',
    '/images/side.jpg',
    '/images/side2.jpg',
    '/images/side3.jpg',
  ]

  return (
    <>
        <footer className="bg-sky-50 text-black px-4 sm:px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {/* Left: Logo & Contact */}
            <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4">
                <Image src="/images/GHP Logo2.png" alt="ghp logo" width={120} height={120} className="sm:w-[150px] sm:h-[150px]" />
            </div>

            <div className="flex items-start gap-3 mb-2 text-sm">
                <FaHome className="mt-1 text-sky-600 flex-shrink-0" />
                <p>8724+V8X, Rue de Industrie, Gisenyi</p>
            </div>

            <div className="flex items-start gap-3 mb-6 text-sm">
                <FaEnvelope className="mt-1 text-sky-600 flex-shrink-0" />
                <p>info@bold-themes.com</p>
            </div>

            <p className="font-medium mb-2">Follow us:</p>
            <div className="flex gap-4 text-white">
                <a href="#" className="bg-sky-600 p-2 rounded-full hover:bg-sky-700 transition-colors">
                <FaFacebookF />
                </a>
                <a href="#" className="bg-sky-600 p-2 rounded-full hover:bg-sky-700 transition-colors">
                <FaTwitter />
                </a>
                <a href="#" className="bg-sky-600 p-2 rounded-full hover:bg-sky-700 transition-colors">
                <FaYoutube />
                </a>
            </div>
            </div>

            {/* Links */}
            <div className='sm:pl-0 lg:pl-8'>
            <h4 className="text-sky-600 font-bold uppercase mb-4">Links</h4>
            <ul className="space-y-2 text-sm">
                {links.map((link, index) => (
                <li key={index}>
                    <Link
                    href="#"
                    className="border-b border-gray-700 pb-1 inline-block hover:text-black transition"
                    >
                    {link}
                    </Link>
                </li>
                ))}
            </ul>
            </div>

            {/* Instagram */}
            <div>
            <h4 className="text-sky-600 font-bold uppercase mb-4">Instagram</h4>
            <div className="grid grid-cols-3 gap-2">
                {instagramImages.map((src, idx) => (
                <div key={idx} className="w-full aspect-square relative overflow-hidden rounded">
                    <Image 
                      src={src} 
                      alt={`Instagram ${idx + 1}`} 
                      fill 
                      className="object-cover hover:scale-105 transition-transform duration-300" 
                      sizes="(max-width: 768px) 33vw, (max-width: 1200px) 17vw, 17vw"
                    />
                </div>
                ))}
            </div>
            </div>

            {/* Call Us */}
            <div>
            <h4 className="text-sky-600 font-bold uppercase mb-4">Call Us</h4>
            <div className="flex items-center gap-3 text-sky-600 font-bold text-lg mb-4">
                <FaPhoneAlt />
                <span>+250789830676</span>
            </div>
            <p className="text-sm text-gray-700 mb-6">
                Gisenyi Home Pass is your trusted partner for finding the perfect home in Gisenyi. Contact us today to start your journey!
            </p>
            </div>
        </div>

        </footer>
        <div className="bg-sky-500 text-white py-6 md:py-8">
            <div className="max-w-6xl mx-auto text-center text-sm px-4">
                &copy; {new Date().getFullYear()} Gisenyi Home Pass. All rights reserved.
            </div>
        </div>
    </>
  )
}
