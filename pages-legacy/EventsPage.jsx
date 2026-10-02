"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { EventCard } from '@/components/EventCard';
import { eventApi } from '@/lib/services/eventApi';
import { transformEventList } from '@/lib/utils/eventTransformer';
import { Search, Filter, Calendar, Tag, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { debounce } from 'lodash';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Ref to track if initial load is done
  const isInitialMount = useRef(true);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'concert', label: 'Concerts' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'sports', label: 'Sports' },
    { value: 'festival', label: 'Festivals' },
    { value: 'fashion', label: 'Fashion' },
  ];

  const periods = [
    { value: 'all', label: 'All Events' },
    { value: 'this-week', label: "Popular this week" },
    { value: 'today', label: "Today's vibe" },
    { value: 'free', label: 'Free events' },
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'popular', label: 'Popular' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
  ];

  // Debounced search handler with lowercase conversion
  const debouncedSetSearch = useCallback(
    debounce((value) => {
      setDebouncedSearchQuery(value.toLowerCase());
    }, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearching(true);
    debouncedSetSearch(value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setIsSearching(false);
    debouncedSetSearch.cancel();
  };

  // Load events when filters change (except search - handled by debounce)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadCombinedEvents(true);
      return;
    }
    loadCombinedEvents(true);
  }, [selectedCategory, selectedPeriod, sortBy]);

  // Load events when debounced search changes
  useEffect(() => {
    if (!isInitialMount.current) {
      loadCombinedEvents(true);
    }
  }, [debouncedSearchQuery]);

  const loadCombinedEvents = async (reset = false) => {
    // Don't show full page loader for search
    if (reset && !isSearching) {
      setLoading(true);
      setCurrentPage(1);
    } else if (reset && isSearching) {
      // Show subtle loading for search
      setCurrentPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = {
        page: reset ? 1 : currentPage + 1,
        per_page: 12,
        sort_by: 'from',
        sort_order: 'asc',
      };

      // Use debounced search value (already lowercase)
      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery;
      }
      if (selectedCategory !== 'all') params.category = selectedCategory;
      
      if (selectedPeriod === 'this-week') {
        const today = new Date();
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
        params.from_date = today.toISOString().split('T')[0];
        params.to_date = endOfWeek.toISOString().split('T')[0];
      } else if (selectedPeriod === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params.from_date = today;
        params.to_date = today;
      } else if (selectedPeriod === 'free') {
        params.price_max = 0;
      }

      const response = await eventApi.getCombined(params);
      
      if (response.success && response.data) {
        const items = response.data.items || [];
        // Transform events and apply case-insensitive filter locally if needed
        let newEvents = transformEventList(items);
        
        // If you want to filter locally for case-insensitive matching
        // (in case the API doesn't support case-insensitive search)
        if (debouncedSearchQuery) {
          newEvents = newEvents.filter(event => {
            const searchLower = debouncedSearchQuery.toLowerCase();
            const titleMatch = event.title?.toLowerCase().includes(searchLower);
            const descMatch = event.description?.toLowerCase().includes(searchLower);
            const locationMatch = event.location?.toLowerCase().includes(searchLower);
            return titleMatch || descMatch || locationMatch;
          });
        }
        
        if (reset) {
          setEvents(newEvents);
          setCurrentPage(1);
        } else {
          setEvents(prev => [...prev, ...newEvents]);
          setCurrentPage(prev => prev + 1);
        }
        
        if (response.data.pagination) {
          const { current_page, last_page } = response.data.pagination;
          setHasMore(current_page < last_page);
        }
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsSearching(false);
    }
  };

  const clearFilters = () => {
    clearSearch();
    setSelectedCategory('all');
    setSelectedPeriod('all');
    setSortBy('date');
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedPeriod !== 'all' || sortBy !== 'date';

  // Show loading only on initial page load
  if (loading && events.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Header */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white mb-4">
            Discover Experiences
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Find events and unique experiences happening near you. 
          </p>
        </div>

        {/* Search Bar - Enhanced */}
        <div className="max-w-3xl mx-auto mb-6">
  <div className="relative">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
    <input
      type="text"
      placeholder="Search events..."
      value={searchQuery}
      onChange={handleSearchChange}
      className="w-full pl-12 pr-12 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 smooth-transition shadow-lg"
    />
    
    {/* Clear button - FIXED */}
    {searchQuery && (
      <button
        onClick={clearSearch}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
        aria-label="Clear search"
      >
        <X className="h-5 w-5" />
      </button>
    )}
    
    {/* Search indicator */}
    {isSearching && (
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    )}
  </div>
  
  {/* Search results info */}
  {!isSearching && debouncedSearchQuery && (
    <p className="text-sm text-muted-foreground mt-2 text-center">
      Showing results for "{debouncedSearchQuery}"
    </p>
  )}
</div>

        {/* Filter Toggle Button - Mobile */}
        <div className="flex justify-center mb-6 lg:hidden">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-white/20 text-white hover:bg-white/10 gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {/* Filters */}
        <div className={`max-w-5xl mx-auto ${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 smooth-transition appearance-none cursor-pointer shadow-md"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value} className="bg-black">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 smooth-transition appearance-none cursor-pointer shadow-md"
              >
                {periods.map(period => (
                  <option key={period.value} value={period.value} className="bg-black">
                    {period.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 smooth-transition appearance-none cursor-pointer shadow-md"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-black">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-white/20 text-white hover:bg-white/10 gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Skeleton loader for search */}
        {isSearching && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50 transition-opacity">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!isSearching && events.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-12">
                <Button
                  onClick={() => loadCombinedEvents(false)}
                  disabled={loadingMore || isSearching}
                  className="bg-gradient-red hover:opacity-90 text-white px-8 py-6 red-glow smooth-transition disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {!isSearching && events.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-black/40 border border-white/10 rounded-2xl p-12 max-w-md mx-auto shadow-xl">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No experiences found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search query
              </p>
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default EventsPage;