"use client"

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { getFeaturedEvents } from '@/data/mockEvents';

const AUTOPLAY_INTERVAL = 8000;

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const featuredEvents = getFeaturedEvents();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
      setProgressKey((prev) => prev + 1);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [featuredEvents.length]);

  return (
    <div className="relative h-[400px] sm:h-[500px] md:h-[550px] lg:h-[600px] xl:h-[650px] 2xl:h-[700px] w-full overflow-hidden rounded-xl sm:rounded-2xl mt-16 sm:mt-18 md:mt-20">
      {featuredEvents.map((event, index) => (
        <div
          key={event.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full container mx-auto px-3 sm:px-4 md:px-6 lg:px-6 xl:px-8 flex items-center">
            <div className="max-w-xl lg:max-w-2xl xl:max-w-3xl space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 animate-fadeIn">
              {/* Title */}
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white leading-tight">
                {event.title}
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-200 max-w-full sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl overflow-hidden text-ellipsis whitespace-nowrap">
                <span className="sm:hidden">{event.mobileDescription || event.description}</span>
                <span className="hidden sm:inline">{event.description}</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex gap-3 sm:gap-4 pt-2">
                {event.cta?.primary && (
                  <Button
                    size="sm"
                    className="bg-gradient-red hover:opacity-90 text-white text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-full red-glow-strong smooth-transition hover:scale-105 w-auto h-6 sm:h-8"
                    onClick={(e) => {
                      e.preventDefault();
                      const primaryCta = event.cta.primary;

                      console.log('Button clicked:', {
                        eventId: event.id,
                        eventTitle: event.title,
                        url: primaryCta.url,
                        action: primaryCta.action
                      });

                      // Check if there's a URL defined
                      if (primaryCta.url) {
                        console.log('Redirecting to URL:', primaryCta.url);
                        window.location.href = primaryCta.url;
                        return;
                      }

                      // Handle action-based navigation
                      if (primaryCta.action === 'events') {
                        console.log('Redirecting to /events');
                        window.location.href = '/events';
                        return;
                      }

                      // Default fallback
                      console.log('Scrolling to content');
                      window.scrollTo({ top: 800, behavior: 'smooth' });
                    }}
                  >
                    {event.cta.primary.text || 'Get Started'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Progress Bar Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {featuredEvents.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentSlide(index);
              setProgressKey((prev) => prev + 1);
            }}
            className="relative h-1.5 sm:h-2 rounded-full overflow-hidden bg-white/25 hover:bg-white/40 transition-all duration-300"
            style={{ width: index === currentSlide ? '2rem' : '0.5rem' }}
            aria-label={`Go to slide ${index + 1}`}
          >
            {index === currentSlide && (
              <span
                key={progressKey}
                className="absolute inset-y-0 left-0 bg-primary rounded-full animate-hero-progress"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
