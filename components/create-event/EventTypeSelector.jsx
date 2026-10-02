"use client"

import { CheckCircle2, Megaphone, Ticket } from 'lucide-react'

/**
 * The two big "how will attendees join" choice cards: Ticketed vs Promotional.
 */
const EventTypeSelector = ({ eventType, onSelect }) => {
  return (
    <div>
      <h3 className='text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4'>
        How will attendees join?
      </h3>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
        {/* Ticketed Option */}
        <div
          onClick={() => onSelect('ticketed')}
          className={`relative cursor-pointer group p-3 sm:p-5 rounded-xl border-2 transition-all duration-200 ${
            eventType === 'ticketed'
              ? 'bg-primary/5 border-primary shadow-[0_0_20px_rgba(var(--primary),0.1)]'
              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className='flex items-start gap-3 sm:gap-4'>
            <div
              className={`p-2 sm:p-3 rounded-full ${
                eventType === 'ticketed'
                  ? 'bg-primary text-white'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              <Ticket className='h-5 w-5 sm:h-6 sm:w-6' />
            </div>
            <div className='flex-1'>
              <div className='flex items-center justify-between sm:justify-start gap-2'>
                <h4
                  className={`text-sm sm:text-base font-semibold ${
                    eventType === 'ticketed' ? 'text-white' : 'text-zinc-300'
                  }`}
                >
                  Sell Tickets
                </h4>
                {eventType === 'ticketed' && (
                  <CheckCircle2 className='h-4 w-4 text-primary' />
                )}
              </div>
              <p className='text-xs sm:text-sm text-zinc-500 mt-0.5 sm:mt-1'>
                Manage inventory, paid, free, or group tickets.
              </p>
            </div>
          </div>
        </div>

        {/* Promotional Option */}
        <div
          onClick={() => onSelect('promotional')}
          className={`relative cursor-pointer group p-3 sm:p-5 rounded-xl border-2 transition-all duration-200 ${
            eventType === 'promotional'
              ? 'bg-blue-500/5 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
              : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className='flex items-start gap-3 sm:gap-4'>
            <div
              className={`p-2 sm:p-3 rounded-full ${
                eventType === 'promotional'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              <Megaphone className='h-5 w-5 sm:h-6 sm:w-6' />
            </div>
            <div className='flex-1'>
              <div className='flex items-center justify-between sm:justify-start gap-2'>
                <h4
                  className={`text-sm sm:text-base font-semibold ${
                    eventType === 'promotional' ? 'text-white' : 'text-zinc-300'
                  }`}
                >
                  External Ticket Link
                </h4>
                {eventType === 'promotional' && (
                  <CheckCircle2 className='h-4 w-4 text-blue-500' />
                )}
              </div>
              <p className='text-xs sm:text-sm text-zinc-500 mt-0.5 sm:mt-1'>
                Redirect users to a third-party site for tickets.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventTypeSelector
