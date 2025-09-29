// components/SearchBar.tsx
'use client'

import { FaMapMarkerAlt, FaCalendarAlt, FaUser } from 'react-icons/fa'

const SearchBar = () => {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4 z-20">
      <form className="bg-white rounded-md shadow-lg p-3 grid grid-cols-1 sm:grid-cols-5 gap-2">
        <SearchField
          icon={<FaMapMarkerAlt />}
          placeholder="Accommodation type"
        />
        <SearchField
          icon={<FaCalendarAlt />}
          placeholder="Check-In"
        />
        <SearchField
          icon={<FaCalendarAlt />}
          placeholder="Check-Out"
        />
        <SearchField
          icon={<FaUser />}
          placeholder="Guests"
        />
        <button
          type="submit"
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-md px-6"
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
}: {
  icon: React.ReactNode
  placeholder: string
}) => {
  return (
    <div className="flex items-center gap-2 border px-3 py-2 rounded-md text-gray-700 bg-white">
      <span className="text-sky-600">{icon}</span>
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 outline-none bg-transparent text-sm placeholder:text-gray-400"
      />
    </div>
  )
}

export default SearchBar
