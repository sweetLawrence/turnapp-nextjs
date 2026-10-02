"use client"

import { useState, useEffect } from 'react';
import { EventCard } from './EventCard';

export const FeaturedEventsCarousel = ({ events, autoPlay = true, autoPlayInterval = 5000 }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(2);

  // Handle responsive items per slide (1 for Mobile, 2 for Desktop)
  useEffect(() => {
    const handleResize = () => {
      const newItemsPerSlide = window.innerWidth < 768 ? 1 : 2;
      if (newItemsPerSlide !== itemsPerSlide) {
        setItemsPerSlide(newItemsPerSlide);
        setCurrentSlide(0); // Reset to first slide when changing layout
      }
    };

    // Initial call
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerSlide]);

  // Create slides based on itemsPerSlide without circular filling
  const slides = [];
  if (events && events.length > 0) {
    const totalSlides = Math.ceil(events.length / itemsPerSlide);
    
    for (let i = 0; i < totalSlides; i++) {
      const start = i * itemsPerSlide;
      const slideEvents = [];
      
      // Fill the slide with events, but don't wrap around - only use available events
      for (let j = 0; j < itemsPerSlide; j++) {
        const eventIndex = start + j;
        if (eventIndex < events.length) {
          slideEvents.push(events[eventIndex]);
        }
      }
      
      // Only add the slide if it has events
      if (slideEvents.length > 0) {
        slides.push(slideEvents);
      }
    }
  }

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, slides.length]);

  // Safety check: if no events, render nothing
  if (!events || events.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div className="relative h-auto overflow-hidden rounded-xl">
        {slides.map((slideEvents, slideIndex) => (
          <div
            key={slideIndex}
            className={`transition-opacity duration-700 ${
              slideIndex === currentSlide 
                ? 'opacity-100 relative' 
                : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
          >
            {/* Grid configuration: 1 col mobile, 2 cols desktop */}
            <div className={`grid gap-4 sm:gap-6 ${
              itemsPerSlide === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
            }`}>
              {slideEvents.map((event) => (
                <div key={event.id} className="h-full">
                  <EventCard event={event} featured={true} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Dots Navigation - Only show if more than 1 slide */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};