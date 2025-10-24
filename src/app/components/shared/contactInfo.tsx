// ContactInfo.tsx

import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaFacebookF, FaTwitter, FaYoutube } from 'react-icons/fa'
import React from 'react'

type ContactItem = {
  icon: React.ReactNode
  title: string
  lines: string[]
}

const contactInfo: ContactItem[] = [
  {
    icon: <FaMapMarkerAlt className="text-md text-sky-500" />,
    title: 'Office location',
    lines: ['8724+V8X, Rue de Industrie, Gisenyi'],
  },
  {
    icon: <FaEnvelope className="text-md text-sky-500" />,
    title: 'Send a message',
    lines: ['wanderwise641@gmail.com'],
  },
  {
    icon: <FaPhoneAlt className="text-md text-sky-500" />,
    title: 'Call us directly',
    lines: ['+250789830676'],
  },
  {
    icon: <div className="flex flex-col gap-1">
      <FaFacebookF className="text-sky-500" />
      <FaTwitter className="text-sky-500" />
      <FaYoutube className="text-sky-500" />
    </div>,
    title: 'Find us on social media',
    lines: ['Follow us on social platforms'],
  },
]

const ContactInfo: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 px-4">
      {contactInfo.map((item, index) => (
        <div key={index} className="bg-slate-100 p-4 rounded-md shadow">
          <div className="flex items-center gap-2 mb-2">
            {item.icon}
            <h3 className="font-semibold text-lg text-[#1c2a4d]">{item.title}</h3>
          </div>
          <div className="w-30 h-[2px] bg-[#1c2a4d] mb-3" />
          <div className="text-gray-500 text-sm space-y-1">
            {Array.isArray(item.lines) && item.lines.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ContactInfo