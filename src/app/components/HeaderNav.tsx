// components/HeaderNav.tsx
'use client'
import React from 'react'
import Image from 'next/image'

import Link from 'next/link'
import { FaLock, FaPlus } from 'react-icons/fa'

const HeaderNav = () => {
  return (
    <header className="absolute bg-gradient-to-r from-sky-300 to-sky-700 top-0 left-0 w-full z-50 px-12 flex justify-between items-center text-white">
      {/* Navigation */}
      <nav className="w-full flex max-w-6xl justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            src="/images/GHP Logo2.png" // Replace with your logo path
            alt="Logo"
            width={90}
            height={90}
            className="rounded-full"
          />
        </div>

          <div className='md:flex text-md space-x-6 hidden font-bold'>
            <Link href="/">Home</Link>
            <Link href="/accommodations">Accommodations</Link>
            <Link href="">Available <sup className='text-rose-500 text-xs'> Now </sup></Link>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact us</Link>
          </div>
          <div className="flex items-center space-x-3 font-bold">
            <Link href="#" className="flex items-center space-x-1">
              <FaLock className="text-sm text-[#a9cae6]" />
              <span>Login</span>
            </Link>
            <Link href="#" className="flex items-center space-x-1">
              <FaPlus className="text-sm text-[#b1d9fd]" />
              <span>Sign Up</span>
            </Link>
          </div>
      </nav>
    </header>
  )
}

export default HeaderNav
