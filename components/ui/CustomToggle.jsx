"use client"

import { Loader2 } from 'lucide-react'
import { useState } from 'react'

export const CustomToggle = ({
  enabled,
  onChange,
  enabledLabel = 'Unfeatured',
  disabledLabel = 'Feature',
  loading = false,
  disabled = false,
  className = '',
  onColor = 'yellow',
  offColor = 'zinc',
  icon: Icon,
  iconClassName = '',
  tooltipOn = 'Click to unfeature this event',
  tooltipOff = 'Click to feature this event',
}) => {
  const [showTooltip, setShowTooltip] = useState(false)

  const handleClick = () => {
    if (loading || disabled) return
    onChange(!enabled)
  }

  const colorClasses = {
    yellow: {
      bg: 'bg-yellow-500/20 hover:bg-yellow-500/30',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
    },
    zinc: {
      bg: 'bg-zinc-800/50 hover:bg-zinc-700',
      border: 'border-zinc-700',
      text: 'text-zinc-400',
    },
    primary: {
      bg: 'bg-primary hover:bg-primary/90',
      border: 'border-primary/30',
      text: 'text-primary-foreground',
    },
    emerald: {
      bg: 'bg-emerald-500/20 hover:bg-emerald-500/30',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
    },
    red: {
      bg: 'bg-red-500/20 hover:bg-red-500/30',
      border: 'border-red-500/30',
      text: 'text-red-400',
    },
  }

  const onStyles = colorClasses[onColor] || colorClasses.yellow
  const offStyles = colorClasses[offColor] || colorClasses.zinc

  const styles = enabled ? onStyles : offStyles
  const tooltipText = enabled ? tooltipOn : tooltipOff

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || disabled}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 ${
          styles.bg
        } ${styles.border} ${styles.text} ${
          loading || disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            {Icon && <Icon className={`h-3.5 w-3.5 ${iconClassName}`} />}
            <span>{enabled ? enabledLabel : disabledLabel}</span>
          </>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && !loading && !disabled && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-zinc-900 text-zinc-300 text-xs rounded-lg border border-zinc-700 whitespace-nowrap shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {tooltipText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900" />
        </div>
      )}
    </div>
  )
}

export default CustomToggle