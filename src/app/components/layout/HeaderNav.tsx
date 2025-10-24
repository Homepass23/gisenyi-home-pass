'use client'
import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FaUser, FaSignOutAlt, FaChevronDown, FaBars, FaTimes, FaKey } from 'react-icons/fa'
import { useAuth } from '../../../context/AuthContext'
import AccommodationPopup from '../features/AccommodationPopup'

const HeaderNav = () => {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isAccommodationPopupOpen, setIsAccommodationPopupOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Detect scroll
  useEffect(() => {
    const handleScroll = () => {
      if (pathname === '/') setIsScrolled(window.scrollY > 10)
      else setIsScrolled(true)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
        setIsDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const mobileMenu = document.getElementById('mobile-menu')
      const mobileMenuButton = document.getElementById('mobile-menu-button')
      if (mobileMenu && !mobileMenu.contains(event.target as Node) && 
          mobileMenuButton && !mobileMenuButton.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
    await signOut()
    router.push('/')
  }

  const getUserInitials = (name: string | undefined) => {
    if (!name) return 'U'
    const names = name.split(' ')
    return names.length > 1
      ? names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase()
      : names[0][0].toUpperCase()
  }

  // Navbar styling logic
  const getNavbarClasses = () => {
    if (pathname === '/') {
      return isScrolled
        ? 'fixed bg-white top-0 left-0 w-full z-50 px-4 sm:px-6 md:px-12 flex justify-between items-center text-sky-600 shadow-md transition-all duration-300'
        : 'absolute bg-transparent top-0 left-0 w-full z-50 px-4 sm:px-6 md:px-12 flex justify-between items-center text-white transition-all duration-300'
    } else {
      return 'fixed bg-white top-0 left-0 w-full z-50 px-4 sm:px-6 md:px-12 flex justify-between items-center text-sky-600 shadow-md'
    }
  }

  const getLinkClasses = () => {
    return pathname === '/' && !isScrolled
      ? 'hover:text-sky-200 transition-colors'
      : 'hover:text-sky-800 transition-colors'
  }

  const getProfileTextClass = () => {
    return pathname === '/' && !isScrolled ? 'text-white' : 'text-sky-800'
  }

  return (
    <header className={getNavbarClasses()}>
      <nav className="w-full flex max-w-6xl justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/GHP Logo2.png"
            alt="Logo"
            width={60}
            height={60}
            className="rounded-full sm:w-[70px] sm:h-[70px] md:w-[84px] md:h-[84px]"
          />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex text-md leading-8 space-x-8 font-semibold">
          <Link href="/" className={getLinkClasses()}>
            Home
          </Link>
          <Link href="/accommodations" className={getLinkClasses()}>
            Accommodations
          </Link>
          <button onClick={() => setIsAccommodationPopupOpen(true)} className={getLinkClasses()}>
            Available <sup className="text-rose-500 text-xs">Now</sup>
          </button>
          <Link href="/about" className={getLinkClasses()}>
            About Us
          </Link>
          <Link href="/contact" className={getLinkClasses()}>
            Contact Us
          </Link>
        </div>

        {/* Desktop Auth / Profile Section */}
        <div className={`hidden lg:flex items-center space-x-3 font-bold ${getProfileTextClass()}`}>
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-2 rounded-full px-2.5 py-1.5 transition-all duration-300
                  ${pathname === '/' && !isScrolled
                    ? 'bg-white/20 hover:bg-white/30 text-white'
                    : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 shadow-sm'}
                `}
              >
                {user.profile_image_url ? (
                  <div className="relative w-9 h-9">
                    <Image
                      src={user.profile_image_url}
                      alt={user.full_name || 'User'}
                      width={36}
                      height={36}
                      className="rounded-full object-cover border-2 border-sky-300 shadow-sm"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></span>
                  </div>
                ) : (
                  <div
                    className={`w-9 h-9 flex items-center justify-center rounded-full font-semibold shadow-sm
                      ${pathname === '/' && !isScrolled
                        ? 'bg-white/30 text-white border border-white/40'
                        : 'bg-gradient-to-br from-sky-400 to-sky-600 text-white border border-sky-300'}
                    `}
                  >
                    {getUserInitials(user.full_name || undefined)}
                  </div>
                )}
                <span className="text-sm font-medium tracking-wide">
                  {user.full_name?.split(' ')[0] ?? 'User'}
                </span>
                <FaChevronDown
                  className={`text-xs transition-transform duration-300 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown */}
              <div
                className={`absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-sky-100 py-2
                  transition-all duration-200 transform origin-top-right
                  ${isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
                `}
              >
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-sky-700">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>

                <Link
                  href={
                    user.role === 'admin'
                      ? '/admin'
                      : user.role === 'host'
                      ? '/owner'
                      : '/customer'
                  }
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaUser className="text-sky-600" />
                  <span>My Dashboard</span>
                </Link>

                <Link
                  href="/profile/edit"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaUser className="text-sky-600" />
                  <span>Edit Profile</span>
                </Link>

                <Link
                  href="/profile/change-password"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaKey className="text-sky-600" />
                  <span>Change Password</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                >
                  <FaSignOutAlt className="text-sky-600" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className={`flex items-center space-x-1 rounded-full px-3 py-1 transition-colors ${
                  pathname === '/' && !isScrolled
                    ? 'bg-white/20 hover:bg-white/30'
                    : 'bg-sky-100 hover:bg-sky-200'
                }`}
              >
                <FaUser
                  className={`text-sm ${
                    pathname === '/' && !isScrolled ? 'text-white' : 'text-sky-600'
                  }`}
                />
                <span>Login</span>
              </Link>
              <Link
                href="/login?action=register"
                className={`flex items-center space-x-1 rounded-full px-3 py-1 transition-colors ${
                  pathname === '/' && !isScrolled
                    ? 'bg-white/20 hover:bg-white/30'
                    : 'bg-sky-100 hover:bg-sky-200'
                }`}
              >
                <FaUser
                  className={`text-sm ${
                    pathname === '/' && !isScrolled ? 'text-white' : 'text-sky-600'
                  }`}
                />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          id="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`lg:hidden p-2 rounded-md transition-colors ${
            pathname === '/' && !isScrolled
              ? 'text-white hover:bg-white/20'
              : 'text-sky-600 hover:bg-sky-100 border border-sky-200'
          }`}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`lg:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-200 transition-all duration-300 z-40 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="px-4 py-6 space-y-4">
          {/* Mobile Navigation Links */}
          <div className="space-y-3">
            <Link
              href="/"
              className="block text-sky-600 hover:text-sky-800 font-semibold py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/accommodations"
              className="block text-sky-600 hover:text-sky-800 font-semibold py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Accommodations
            </Link>
            <button
              onClick={() => {
                setIsAccommodationPopupOpen(true)
                setIsMobileMenuOpen(false)
              }}
              className="block text-sky-600 hover:text-sky-800 font-semibold py-2 text-left"
            >
              Available <sup className="text-rose-500 text-xs">Now</sup>
            </button>
            <Link
              href="/about"
              className="block text-sky-600 hover:text-sky-800 font-semibold py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="block text-sky-600 hover:text-sky-800 font-semibold py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Auth Section */}
          <div className="pt-4 border-t border-gray-200">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {user.profile_image_url ? (
                    <div className="relative w-10 h-10">
                      <Image
                        src={user.profile_image_url}
                        alt={user.full_name || 'User'}
                        width={40}
                        height={40}
                        className="rounded-full object-cover border-2 border-sky-300 shadow-sm"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center rounded-full font-semibold shadow-sm bg-gradient-to-br from-sky-400 to-sky-600 text-white border border-sky-300">
                      {getUserInitials(user.full_name || undefined)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-sky-700">{user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Link
                  href={
                    user.role === 'admin'
                      ? '/admin'
                      : user.role === 'host'
                      ? '/owner'
                      : '/customer'
                  }
                  className="flex items-center gap-3 text-sky-600 hover:text-sky-800 font-semibold py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaUser />
                  <span>My Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-sky-600 hover:text-sky-800 font-semibold py-2"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="flex items-center space-x-2 text-sky-600 hover:text-sky-800 font-semibold py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaUser />
                  <span>Login</span>
                </Link>
                <Link
                  href="/login?action=register"
                  className="flex items-center space-x-2 text-sky-600 hover:text-sky-800 font-semibold py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaUser />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accommodation Popup */}
      {isAccommodationPopupOpen && (
        <AccommodationPopup onClose={() => setIsAccommodationPopupOpen(false)} />
      )}
    </header>
  )
}

export default HeaderNav
