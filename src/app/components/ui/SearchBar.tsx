// components/SearchBar.tsx
'use client'

import { FaHome, FaCalendarAlt, FaUser } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const SearchBar = () => {
  const router = useRouter()
  const [accommodationType, setAccommodationType] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build query parameters
    const params = new URLSearchParams()
    if (accommodationType) params.append('type', accommodationType)
    if (checkIn) params.append('checkIn', checkIn)
    if (checkOut) params.append('checkOut', checkOut)
    if (guests) params.append('guests', guests)
    
    // Navigate to accommodations page with search parameters
    router.push(`/accommodations?${params.toString()}`)
  }

  return (
    <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4 z-20">
      <form onSubmit={handleSubmit} className="bg-white rounded-md shadow-lg p-2 sm:p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
        <div className="flex items-center gap-2 border px-2 sm:px-3 py-2 sm:py-2.5 rounded-md text-gray-700 bg-white">
          <span className="text-sky-600 text-sm sm:text-base"><FaHome /></span>
          <select
            value={accommodationType}
            onChange={(e) => setAccommodationType(e.target.value)}
            className="flex-1 outline-none bg-transparent text-xs sm:text-sm placeholder:text-gray-400"
          >
            <option value="">Select Type</option>
            <option value="house">Entire House</option>
            <option value="room">Private Room</option>
          </select>
        </div>
        <SearchField
          icon={<FaCalendarAlt />}
          placeholder="Check-In"
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
        />
        <SearchField
          icon={<FaCalendarAlt />}
          placeholder="Check-Out"
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
        />
        <SearchField
          icon={<FaUser />}
          placeholder="Guests"
          type="number"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
        />
        <button
          type="submit"
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md px-4 sm:px-6 py-2 sm:py-3 transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  )
}

const SearchField = ({
  icon,
  placeholder,
  type = 'text',
  value,
  onChange,
}: {
  icon: React.ReactNode
  placeholder: string
  type?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  return (
    <div className="flex items-center gap-2 border px-2 sm:px-3 py-2 sm:py-2.5 rounded-md text-gray-700 bg-white">
      <span className="text-sky-600 text-sm sm:text-base">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="flex-1 outline-none bg-transparent text-xs sm:text-sm placeholder:text-gray-400"
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default SearchBar