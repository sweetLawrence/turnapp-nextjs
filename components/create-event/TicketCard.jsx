"use client"

import { Ticket, Users, X, ChevronDown, Calendar, Clock } from 'lucide-react'
import { useState } from 'react'

const TicketCard = ({ ticket, index, currency, onUpdate, onRemove, canRemove }) => {
  const isFree = ticket.type === 'free'
  const isGroup = ticket.type === 'group'
  const [isOpen, setIsOpen] = useState(false)

  const ticketTypes = [
    { value: 'single', label: 'Single' },
    { value: 'group', label: 'Group' },
    { value: 'free', label: 'Free' }
  ]

  const getTypeLabel = (value) => {
    const found = ticketTypes.find(t => t.value === value)
    return found ? found.label : 'Single'
  }

  const getTypeColor = (value) => {
    switch (value) {
      case 'single': return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'group': return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      case 'free': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
    }
  }

  return (
    <div className="group bg-zinc-900/80 border border-zinc-800/60 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4 bg-zinc-800/30 border-b border-zinc-800/60">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Ticket className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={ticket.name}
              onChange={(e) => onUpdate(index, 'name', e.target.value)}
              className="w-full bg-zinc-800/50 hover:bg-zinc-800 focus:bg-zinc-800 text-base font-semibold text-white placeholder:text-zinc-500 focus:outline-none rounded-lg px-3 py-2 border border-transparent focus:border-primary/50 transition-all duration-200"
              placeholder="Enter ticket name..."
              required
            />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Ticket Type Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${getTypeColor(ticket.type)}`}
            >
              <span>{getTypeLabel(ticket.type)}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-36 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                {ticketTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      onUpdate(index, 'type', type.value)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-zinc-800 ${
                      ticket.type === type.value ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      type.value === 'single' ? 'bg-blue-400' :
                      type.value === 'group' ? 'bg-purple-400' :
                      'bg-emerald-400'
                    }`} />
                    {type.label}
                    {ticket.type === type.value && (
                      <span className="ml-auto text-primary">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {canRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Description */}
        <input
          type="text"
          value={ticket.description}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          className="w-full bg-zinc-800/30 hover:bg-zinc-800/50 focus:bg-zinc-800/50 text-sm text-zinc-400 placeholder:text-zinc-600 focus:outline-none rounded-lg px-3 py-2 border border-transparent focus:border-zinc-700 transition-all duration-200"
          placeholder="Brief description of this ticket tier..."
        />

        {/* Pricing & Capacity Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-800/50">
            <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1">
              Price ({currency})
            </label>
            {isFree ? (
              <span className="text-sm font-bold text-emerald-400">FREE</span>
            ) : (
              <input
                type="number"
                value={ticket.price}
                onChange={(e) => onUpdate(index, 'price', e.target.value)}
                className="w-full bg-zinc-800/50 hover:bg-zinc-800 focus:bg-zinc-800 text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none rounded-lg px-3 py-2 border border-transparent focus:border-primary/50 transition-all duration-200"
                placeholder="0.00"
                required
              />
            )}
          </div>

          <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-800/50">
            <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1">
              Capacity
            </label>
            <input
              type="number"
              value={ticket.quantity}
              onChange={(e) => onUpdate(index, 'quantity', e.target.value)}
              className="w-full bg-zinc-800/50 hover:bg-zinc-800 focus:bg-zinc-800 text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none rounded-lg px-3 py-2 border border-transparent focus:border-primary/50 transition-all duration-200"
              placeholder="Total"
              required
            />
          </div>

          {isGroup && (
            <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-800/50">
              <label className="block text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1">
                Group Size
              </label>
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0" />
                <input
                  type="number"
                  value={ticket.group_size}
                  onChange={(e) => onUpdate(index, 'group_size', e.target.value)}
                  className="flex-1 bg-zinc-800/50 hover:bg-zinc-800 focus:bg-zinc-800 text-sm font-bold text-white placeholder:text-zinc-600 focus:outline-none rounded-lg px-3 py-2 border border-transparent focus:border-primary/50 transition-all duration-200"
                  placeholder="Min"
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* 🆕 SALES CONTROLS SECTION */}
        <div className="border-t border-zinc-800/50 pt-4 space-y-4">
          {/* Sales Status Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-zinc-300 font-medium">Sales Status</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onUpdate(index, 'sales_status', 'open')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  ticket.sales_status !== 'closed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                }`}
              >
                Available
              </button>
              <button
                type="button"
                onClick={() => onUpdate(index, 'sales_status', 'closed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  ticket.sales_status === 'closed'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                }`}
              >
                Sales Closed
              </button>
            </div>
          </div>

          {/* Sale Period */}
          <div className="space-y-3">
            <label className="text-sm text-zinc-300 font-medium block">Sale Period</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Start</label>
                <div className="flex items-center gap-2 bg-zinc-800/30 rounded-lg p-2 border border-zinc-800/50">
                  <Calendar className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                  <input
                    type="datetime-local"
                    value={ticket.sale_starts_at || ''}
                    onChange={(e) => onUpdate(index, 'sale_starts_at', e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] text-zinc-500 uppercase tracking-wider mb-1">End</label>
                <div className="flex items-center gap-2 bg-zinc-800/30 rounded-lg p-2 border border-zinc-800/50">
                  <Clock className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                  <input
                    type="datetime-local"
                    value={ticket.sale_ends_at || ''}
                    onChange={(e) => onUpdate(index, 'sale_ends_at', e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-zinc-500">Leave empty for no start/end restriction</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketCard