"use client"

import { Sparkles, Users, X } from 'lucide-react'

const HighlightsAndLineup = ({
  formData,
  highlightInput,
  setHighlightInput,
  lineupInput,
  setLineupInput,
  handleArrayInput,
  addArrayItem,
  removeArrayItem
}) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'>
      {/* Highlights */}
      <div className='bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6'>
        <div className='flex items-center justify-between mb-3 sm:mb-4'>
          <div className='flex items-center gap-2 text-white font-medium text-sm sm:text-base'>
            <Sparkles className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500' />
            <span>
              Highlights{' '}
              <span className='text-[10px] sm:text-xs text-zinc-500 font-normal'>
                (Optional)
              </span>
            </span>
          </div>
          <span className='text-[10px] sm:text-xs text-zinc-500'>
            {formData.event_highlights.length}/5
          </span>
        </div>
        <input
          type='text'
          value={highlightInput}
          onChange={e =>
            handleArrayInput(e, setHighlightInput, 'event_highlights')
          }
          onKeyDown={e =>
            e.key === 'Enter' &&
            (e.preventDefault(),
            addArrayItem(highlightInput, setHighlightInput, 'event_highlights'))
          }
          className='w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-500 mb-2 sm:mb-3 placeholder:text-zinc-600'
          placeholder='Type & press Enter...'
          disabled={formData.event_highlights.length >= 5}
        />
        <div className='flex flex-wrap gap-2'>
          {formData.event_highlights.map((highlight, index) => (
            <span
              key={index}
              className='inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 text-[10px] sm:text-xs text-zinc-300 border border-zinc-700'
            >
              {highlight}
              <X
                className='h-3 w-3 cursor-pointer hover:text-white'
                onClick={() => removeArrayItem(index, 'event_highlights')}
              />
            </span>
          ))}
        </div>
      </div>

      {/* Lineup */}
      <div className='bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6'>
        <div className='flex items-center gap-2 mb-3 sm:mb-4 text-white font-medium text-sm sm:text-base'>
          <Users className='h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500' />
          <span>
            Lineup{' '}
            <span className='text-[10px] sm:text-xs text-zinc-500 font-normal'>
              (Optional)
            </span>
          </span>
        </div>
        <input
          type='text'
          value={lineupInput}
          onChange={e => handleArrayInput(e, setLineupInput, 'lineup')}
          onKeyDown={e =>
            e.key === 'Enter' &&
            (e.preventDefault(), addArrayItem(lineupInput, setLineupInput, 'lineup'))
          }
          className='w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-zinc-500 mb-2 sm:mb-3 placeholder:text-zinc-600'
          placeholder='Type & press Enter...'
        />
        <div className='flex flex-wrap gap-2'>
          {formData.lineup.map((item, index) => (
            <span
              key={index}
              className='inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 text-[10px] sm:text-xs text-zinc-300 border border-zinc-700'
            >
              {item}
              <X
                className='h-3 w-3 cursor-pointer hover:text-white'
                onClick={() => removeArrayItem(index, 'lineup')}
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HighlightsAndLineup