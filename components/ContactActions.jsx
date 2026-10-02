"use client"

import { Phone } from 'lucide-react'

const contactButtonClasses =
  'inline-flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg smooth-transition hover:-translate-y-0.5 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background'

export const ContactActions = () => (
  <div className='fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40'>
    <a
      href='tel:+254711682365'
      aria-label='Call Turn App at +254 711 682365'
      title='Call Turn App'
      className={`${contactButtonClasses} bg-gradient-red red-glow-strong`}
    >
      <Phone className='h-5 w-5' />
    </a>
  </div>
)
