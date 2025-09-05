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

const Footer: React.FC = () => {
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
        <footer className="bg-sky-50 text-black px-6 py-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Left: Logo & Contact */}
            <div>
            <div className="mb-4">
                <Image src="/images/GHP Logo2.png" alt="ghp logo" width={150} height={150} />
            </div>

            <div className="flex items-start gap-3 mb-2 text-sm">
                <FaHome className="mt-1 text-sky-600" />
                <p>8724+V8X, Rue de Industrie, Gisenyi</p>
            </div>

            <div className="flex items-start gap-3 mb-6 text-sm">
                <FaEnvelope className="mt-1 text-sky-600" />
                <p>info@bold-themes.com</p>
            </div>

            <p className="font-medium mb-2">Follow us:</p>
            <div className="flex gap-4 text-white">
                <a href="#" className="bg-sky-600 p-2 rounded-full">
                <FaFacebookF />
                </a>
                <a href="#" className="bg-sky-600 p-2 rounded-full">
                <FaTwitter />
                </a>
                <a href="#" className="bg-sky-600 p-2 rounded-full">
                <FaYoutube />
                </a>
            </div>
            </div>

            {/* Links */}
            <div className='pl-8'>
            <h4 className="text-sky-600 pt-20 font-bold uppercase mb-4">Links</h4>
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
            <h4 className="text-sky-600 pt-20 font-bold uppercase mb-4">Instagram</h4>
            <div className="grid grid-cols-3 gap-2">
                {instagramImages.map((src, idx) => (
                <div key={idx} className="w-full aspect-square relative overflow-hidden rounded">
                    <Image src={src} alt={`Instagram ${idx + 1}`} fill className="object-cover" />
                </div>
                ))}
            </div>
            </div>

            {/* Call Us */}
            <div>
            <h4 className="text-sky-600 font-bold pt-20 uppercase mb-4">Call Us</h4>
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
        <div className="bg-sky-500 text-white py-8">
            <div className="max-w-6xl mx-auto text-center text-sm">
                &copy; {new Date().getFullYear()} Gisenyi Home Pass. All rights reserved.
            </div>
        </div>
    </>
  )
}

export default Footer
