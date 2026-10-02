"use client"

import { Calendar, Music, PartyPopper, Ticket } from 'lucide-react';

export const EventImagePlaceholder = ({ title, category = 'general', className = '' }) => {
  // Choose icon based on category
  const getIcon = () => {
    const categoryLower = category?.toLowerCase() || 'general';
    
    if (categoryLower.includes('music') || categoryLower.includes('concert')) {
      return <Music className="h-16 w-16" />;
    }
    if (categoryLower.includes('party') || categoryLower.includes('club')) {
      return <PartyPopper className="h-16 w-16" />;
    }
    if (categoryLower.includes('festival') || categoryLower.includes('event')) {
      return <Ticket className="h-16 w-16" />;
    }
    return <Calendar className="h-16 w-16" />;
  };

  // Get first letter of title for avatar
  const getInitial = () => {
    return title ? title.charAt(0).toUpperCase() : 'E';
  };

  return (
    <div className={`relative bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-primary/60">
        {getIcon()}
        <div className="mt-4 text-4xl font-bold opacity-50">
          {getInitial()}
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
    </div>
  );
};
