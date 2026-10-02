"use client"

import { UserCircle } from 'lucide-react'

const OrganizerCard = ({ formData, handleInputChange }) => {
  return (
    <div className='bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden'>
      <div className='p-3 sm:p-4 bg-zinc-800/50 border-b border-white/5'>
        <h3 className='font-semibold text-white flex items-center gap-2 text-sm sm:text-base'>
          <UserCircle className='h-4 w-4 text-zinc-400' />
          Organizer
        </h3>
      </div>
      <div className='p-4 sm:p-5 space-y-3'>
        <input
          type='text'
          name='owner'
          value={formData.owner}
          onChange={handleInputChange}
          placeholder='Organizer Name'
          className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary'
          required
        />
        <input
          type='email'
          name='email'
          value={formData.email}
          onChange={handleInputChange}
          placeholder='Contact Email'
          className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary'
          required
        />
        <input
          type='tel'
          name='phoneNo'
          value={formData.phoneNo}
          onChange={handleInputChange}
          placeholder='Contact Phone'
          className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-primary'
          required
        />
      </div>
    </div>
  )
}

export default OrganizerCard
