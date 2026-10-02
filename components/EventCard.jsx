"use client"

  import { Clock, MapPin, ArrowRight } from 'lucide-react';
  import Link from 'next/link'
  import { Button } from './ui/button';
  import { Badge } from './ui/badge';
  import { EventImagePlaceholder } from './EventImagePlaceholder';
  import { useState } from 'react';

  export const EventCard = ({ event, featured = false, isPast = false }) => {
    // Only tracks failure — the placeholder is skipped entirely when a valid
    // image renders, so nothing shows through transparent PNG areas.
    const [imageError, setImageError] = useState(false);
    const formatDate = (dateString) => {
      if (!dateString) return 'TBA';
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'TBA';
        return date.toLocaleDateString('en-KE', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      } catch (error) {
        return 'TBA';
      }
    };

    const formatTime = (timeString) => {
      if (!timeString) return '';
      const timeParts = timeString.split(':');
      if (timeParts.length >= 2) {
        return `${timeParts[0]}:${timeParts[1]}`;
      }
      return timeString;
    };

    const getTimeDisplay = () => {
      const startTime = formatTime(event.time || event.from_time);
      const endTime = formatTime(event.endTime || event.to_time);
      if (startTime && endTime) return `${startTime} - ${endTime}`;
      if (startTime) return startTime;
      return 'Time TBA';
    };

    const getLowestPrice = () => {
      if (
        event.event_type === 'promotional' &&
        event.price_from &&
        parseFloat(event.price_from) > 0
      ) {
        return parseFloat(event.price_from);
      }

      if (event.prices && Array.isArray(event.prices) && event.prices.length > 0) {
        const validPrices = event.prices
          .filter((p) => p.price > 0)
          .map((p) => parseFloat(p.price));
        if (validPrices.length > 0) return Math.min(...validPrices);
      }

      if (event.tickets && Array.isArray(event.tickets) && event.tickets.length > 0) {
        const validPrices = event.tickets
          .filter(
            (t) => t.price > 0 && (t.available === undefined || t.available > 0)
          )
          .map((t) => parseFloat(t.price));
        if (validPrices.length > 0) return Math.min(...validPrices);
      }

      if (event.price && parseFloat(event.price) > 0) {
        return parseFloat(event.price);
      }

      if (event.price_from && parseFloat(event.price_from) > 0) {
        return parseFloat(event.price_from);
      }

      if (
        event.priceRange &&
        event.priceRange.min !== undefined &&
        parseFloat(event.priceRange.min) > 0
      ) {
        return parseFloat(event.priceRange.min);
      }

      return 0;
    };

    const lowestPrice = getLowestPrice();

    const isSoldOut = () => {
      if (event.tickets && Array.isArray(event.tickets) && event.tickets.length > 0) {
        return event.tickets.every((t) => t.available === 0);
      }
      if (event.prices && Array.isArray(event.prices) && event.prices.length > 0) {
        return event.prices.every((p) => p.available === 0);
      }
      return false;
    };

    const soldOut = isSoldOut();

    // The transformer already resolved every image to a full URL (or null).
    // We just pick the best one — no URL building, no state, no flicker.
    const imageUrl =
      event.image ||
      (Array.isArray(event.images) && event.images.length > 0
        ? event.images[event.cover_image_index ?? 0] || event.images[0]
        : null) ||
      event.poster_url ||
      null;

    const hasValidImage = Boolean(imageUrl) && !imageError;

    const getEventIdentifier = () => event.slug || event.uuid || event.id;

    return (
      <Link href={`/${getEventIdentifier()}`}>
        <div className="glass rounded-lg sm:rounded-xl overflow-hidden group smooth-transition hover:red-glow hover:-translate-y-1 flex flex-col h-full shadow-lg hover:shadow-2xl border border-white/5">
          {/* Image */}
          <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
            {hasValidImage ? (
              <img
                key={imageUrl}
                src={imageUrl}
                alt={event.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover smooth-transition group-hover:scale-110"
                onError={() => setImageError(true)}
              />
            ) : (
              <EventImagePlaceholder
                title={event.title}
                category={event.category}
                className="absolute inset-0"
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Badges */}
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-2">
              {isPast && (
                <Badge variant="secondary" className="text-xs">
                  ENDED
                </Badge>
              )}
              {!isPast && soldOut && (
                <Badge variant="destructive" className="text-xs">
                  SOLD OUT
                </Badge>
              )}
            </div>

            {/* Date Badge */}
            <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 glass-light px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg">
              <p className="text-xs font-medium text-white">
                {formatDate(event.date || event.from)}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col">
            <h3 className="text-sm sm:text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-primary smooth-transition">
              {event.title}
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground/90 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
              {event.shortDescription ||
                event.short_description ||
                event.description ||
                'No description available'}
            </p>

            <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
              <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground/90">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="leading-tight">{getTimeDisplay()}</span>
              </div>
              <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground/90">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="line-clamp-1 leading-tight">
                  {event.venue || event.location || 'Venue TBA'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/10 mt-auto">
              {!soldOut ? (
                <div>
                  {lowestPrice > 0 ? (
                    <>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="text-sm sm:text-base font-bold text-white">
                        {event.currency || 'KES'} {lowestPrice.toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm sm:text-base font-bold text-white">FREE</p>
                  )}
                </div>
              ) : (
                <p className="text-sm sm:text-base font-bold text-destructive">
                  Sold Out
                </p>
              )}

              <Button
                size="sm"
                variant={soldOut ? 'outline' : 'default'}
                className={`text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5 h-7 sm:h-8 ${
                  !soldOut ? 'bg-gradient-red hover:opacity-90 text-white' : ''
                }`}
              >
                {soldOut ? 'View Details' : 'View Event'}
                <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    );
  };










// import { Clock, MapPin, ArrowRight } from 'lucide-react';
// import Link from 'next/link'
// import { Button } from './ui/button';
// import { Badge } from './ui/badge';
// import { EventImagePlaceholder } from './EventImagePlaceholder';
// import { useState, useEffect } from 'react';

// export const EventCard = ({ event, featured = false, isPast = false }) => {
//   // imageLoaded flips once the file arrives; introPlayed flips once the
//   // entrance animation finishes, so hover/scale behaves normally afterward.
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [introPlayed, setIntroPlayed] = useState(false);
//   const [imageError, setImageError] = useState(false);
//   const formatDate = (dateString) => {
//     if (!dateString) return 'TBA';
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return 'TBA';
//       return date.toLocaleDateString('en-KE', {
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric'
//       });
//     } catch (error) {
//       return 'TBA';
//     }
//   };

//   const formatTime = (timeString) => {
//     if (!timeString) return '';
//     const timeParts = timeString.split(':');
//     if (timeParts.length >= 2) {
//       return `${timeParts[0]}:${timeParts[1]}`;
//     }
//     return timeString;
//   };

//   const getTimeDisplay = () => {
//     const startTime = formatTime(event.time || event.from_time);
//     const endTime = formatTime(event.endTime || event.to_time);
//     if (startTime && endTime) return `${startTime} - ${endTime}`;
//     if (startTime) return startTime;
//     return 'Time TBA';
//   };

//   const getLowestPrice = () => {
//     if (
//       event.event_type === 'promotional' &&
//       event.price_from &&
//       parseFloat(event.price_from) > 0
//     ) {
//       return parseFloat(event.price_from);
//     }

//     if (event.prices && Array.isArray(event.prices) && event.prices.length > 0) {
//       const validPrices = event.prices
//         .filter((p) => p.price > 0)
//         .map((p) => parseFloat(p.price));
//       if (validPrices.length > 0) return Math.min(...validPrices);
//     }

//     if (event.tickets && Array.isArray(event.tickets) && event.tickets.length > 0) {
//       const validPrices = event.tickets
//         .filter(
//           (t) => t.price > 0 && (t.available === undefined || t.available > 0)
//         )
//         .map((t) => parseFloat(t.price));
//       if (validPrices.length > 0) return Math.min(...validPrices);
//     }

//     if (event.price && parseFloat(event.price) > 0) {
//       return parseFloat(event.price);
//     }

//     if (event.price_from && parseFloat(event.price_from) > 0) {
//       return parseFloat(event.price_from);
//     }

//     if (
//       event.priceRange &&
//       event.priceRange.min !== undefined &&
//       parseFloat(event.priceRange.min) > 0
//     ) {
//       return parseFloat(event.priceRange.min);
//     }

//     return 0;
//   };

//   const lowestPrice = getLowestPrice();

//   const isSoldOut = () => {
//     if (event.tickets && Array.isArray(event.tickets) && event.tickets.length > 0) {
//       return event.tickets.every((t) => t.available === 0);
//     }
//     if (event.prices && Array.isArray(event.prices) && event.prices.length > 0) {
//       return event.prices.every((p) => p.available === 0);
//     }
//     return false;
//   };

//   const soldOut = isSoldOut();

//   // The transformer already resolved every image to a full URL (or null).
//   // We just pick the best one — no URL building, no state, no flicker.
//   const imageUrl =
//     event.image ||
//     (Array.isArray(event.images) && event.images.length > 0
//       ? event.images[event.cover_image_index ?? 0] || event.images[0]
//       : null) ||
//     event.poster_url ||
//     null;

//   const hasValidImage = Boolean(imageUrl) && !imageError;
//   const showSkeleton = hasValidImage && !imageLoaded;

//   // Reset transition state if the resolved image changes under this card
//   // (e.g. cover image reordered) so we re-animate instead of freezing.
//   useEffect(() => {
//     setImageLoaded(false);
//     setIntroPlayed(false);
//     setImageError(false);
//   }, [imageUrl]);

//   const getEventIdentifier = () => event.slug || event.uuid || event.id;

//   return (
//     <Link href={`/${getEventIdentifier()}`}>
//       <div className="glass rounded-lg sm:rounded-xl overflow-hidden group smooth-transition hover:red-glow hover:-translate-y-1 flex flex-col h-full shadow-lg hover:shadow-2xl border border-white/5">
//         {/* Image */}
//         <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
//           {hasValidImage && (
//             <img
//               key={imageUrl}
//               src={imageUrl}
//               alt={event.title}
//               loading="lazy"
//               decoding="async"
//               onLoad={() => setImageLoaded(true)}
//               onAnimationEnd={() => setIntroPlayed(true)}
//               onError={() => setImageError(true)}
//               className={`absolute inset-0 w-full h-full object-cover group-hover:scale-110 ${
//                 !imageLoaded
//                   ? 'opacity-0'
//                   : introPlayed
//                   ? 'opacity-100 transition-transform duration-300 ease-out'
//                   : 'animate-[fadeScaleIn_700ms_ease-out_forwards]'
//               }`}
//             />
//           )}

//           {showSkeleton && (
//             <div className="absolute inset-0 overflow-hidden bg-zinc-800">
//               <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
//             </div>
//           )}

//           {!hasValidImage && (
//             <EventImagePlaceholder
//               title={event.title}
//               category={event.category}
//               className="absolute inset-0"
//             />
//           )}

//           <style>{`
//             @keyframes shimmer {
//               100% { transform: translateX(100%); }
//             }
//             @keyframes fadeScaleIn {
//               from { opacity: 0; transform: scale(1.06); }
//               to { opacity: 1; transform: scale(1); }
//             }
//           `}</style>

//           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

//           {/* Badges */}
//           <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-2">
//             {isPast && (
//               <Badge variant="secondary" className="text-xs">
//                 ENDED
//               </Badge>
//             )}
//             {!isPast && soldOut && (
//               <Badge variant="destructive" className="text-xs">
//                 SOLD OUT
//               </Badge>
//             )}
//           </div>

//           {/* Date Badge */}
//           <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 glass-light px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg">
//             <p className="text-xs font-medium text-white">
//               {formatDate(event.date || event.from)}
//             </p>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-4 sm:p-5 flex-1 flex flex-col">
//           <h3 className="text-sm sm:text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-primary smooth-transition">
//             {event.title}
//           </h3>

//           <p className="text-xs sm:text-sm text-muted-foreground/90 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
//             {event.shortDescription ||
//               event.short_description ||
//               event.description ||
//               'No description available'}
//           </p>

//           <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
//             <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground/90">
//               <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
//               <span className="leading-tight">{getTimeDisplay()}</span>
//             </div>
//             <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground/90">
//               <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
//               <span className="line-clamp-1 leading-tight">
//                 {event.venue || event.location || 'Venue TBA'}
//               </span>
//             </div>
//           </div>

//           <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/10 mt-auto">
//             {!soldOut ? (
//               <div>
//                 {lowestPrice > 0 ? (
//                   <>
//                     <p className="text-xs text-muted-foreground">From</p>
//                     <p className="text-sm sm:text-base font-bold text-white">
//                       {event.currency || 'KES'} {lowestPrice.toLocaleString()}
//                     </p>
//                   </>
//                 ) : (
//                   <p className="text-sm sm:text-base font-bold text-white">FREE</p>
//                 )}
//               </div>
//             ) : (
//               <p className="text-sm sm:text-base font-bold text-destructive">
//                 Sold Out
//               </p>
//             )}

//             <Button
//               size="sm"
//               variant={soldOut ? 'outline' : 'default'}
//               className={`text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5 h-7 sm:h-8 ${
//                 !soldOut ? 'bg-gradient-red hover:opacity-90 text-white' : ''
//               }`}
//             >
//               {soldOut ? 'View Details' : 'View Event'}
//               <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-1" />
//             </Button>
//           </div>
//         </div>
//       </div>
//     </Link>
//   );
// };