"use client"

import { Loader2, Save } from 'lucide-react'
import { Button } from '../ui/button'

const PublishSidebarCard = ({ loading, eventType, formData, handleInputChange }) => {
  return (
    <div className='hidden lg:block bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg'>
      <div className='flex items-center justify-between mb-3 sm:mb-4'>
        <h3 className='font-semibold text-white text-sm sm:text-base'>
          Publish Event
        </h3>
        <div className='h-2 w-2 rounded-full bg-yellow-500 animate-pulse' />
      </div>
      <Button
        type='submit'
        className='w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-5 sm:py-6 text-base sm:text-lg rounded-xl'
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className='h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2' />{' '}
            Creating...
          </>
        ) : (
          <>
            <Save className='h-4 w-4 sm:h-5 sm:w-5 mr-2' /> Launch Event
          </>
        )}
      </Button>

      {eventType === 'ticketed' && (
        <div className='mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/5 space-y-3'>
          <label className='flex items-center justify-between cursor-pointer group'>
            <span className='text-xs sm:text-sm text-zinc-400 group-hover:text-zinc-300'>
              Enable Affiliate Marketing
            </span>
            <input
              type='checkbox'
              name='affiliate_enabled'
              checked={formData.affiliate_enabled}
              onChange={handleInputChange}
              className='accent-emerald-500 h-4 w-4 rounded'
            />
          </label>
          {formData.affiliate_enabled && (
            <label className='flex items-center justify-between cursor-pointer group ml-2'>
              <span className='text-[10px] sm:text-xs text-zinc-500 group-hover:text-zinc-400'>
                ↳ Auto-approve affiliates
              </span>
              <input
                type='checkbox'
                name='affiliate_auto_approve'
                checked={formData.affiliate_auto_approve}
                onChange={handleInputChange}
                className='accent-emerald-500 h-3.5 w-3.5 rounded'
              />
            </label>
          )}
        </div>
      )}
    </div>
  )
}

export default PublishSidebarCard
