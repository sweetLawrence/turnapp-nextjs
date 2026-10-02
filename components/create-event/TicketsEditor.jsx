"use client"

import { Plus } from 'lucide-react'
import { Button } from '../ui/button'
import TicketCard from './TicketCard'

const emptyTicket = () => ({
  name: '',
  type: 'single',
  price: '',
  quantity: '',
  group_size: '',
  description: ''
})

const TicketsEditor = ({ currency, handleInputChange, tickets, setTickets, updateTicket }) => {
  const addTicket = () => setTickets([...tickets, emptyTicket()])
  const removeTicket = index => setTickets(tickets.filter((_, i) => i !== index))

  return (
    <div className='space-y-4'>
      {/* Currency Selection */}
      <div className='bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5'>
        <h4 className='text-sm font-medium text-zinc-200 mb-3'>Currency</h4>
        <select
          name='currency'
          value={currency}
          onChange={handleInputChange}
          className='w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary'
        >
          <option value='KES'>KES - Kenyan Shilling</option>
          <option value='USD'>USD - US Dollar</option>
          <option value='EUR'>EUR - Euro</option>
          <option value='GBP'>GBP - British Pound</option>
        </select>
      </div>

      <div className='flex items-center justify-between'>
        <h3 className='text-base sm:text-lg font-medium text-zinc-200'>
          Ticket Types
        </h3>
        <Button
          type='button'
          onClick={addTicket}
          size='sm'
          className='bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 h-8 text-xs sm:h-9 sm:text-sm'
        >
          <Plus className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
          Add Ticket
        </Button>
      </div>

      <div className='grid grid-cols-1 gap-3 sm:gap-4'>
        {tickets.map((ticket, index) => (
          <TicketCard
            key={index}
            ticket={ticket}
            index={index}
            currency={currency}
            onUpdate={updateTicket}
            onRemove={removeTicket}
            canRemove={tickets.length > 1}
          />
        ))}
      </div>
    </div>
  )
}

export default TicketsEditor
