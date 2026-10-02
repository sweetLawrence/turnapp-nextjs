"use client"

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, X } from "lucide-react";

const LocationSearch = ({
  value = "",
  onChange,
  onLocationSelect,
  placeholder = "Search for a location...",
  required = false,
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const skipNextSearchRef = useRef(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search OpenStreetMap
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Skip the search triggered by our own setQuery() call inside handleSelect/handleClear
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({
              q: query,
              format: "json",
              addressdetails: 1,
              limit: 5,
              countrycodes: "ke",
            }),
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();

        setResults(data);
        setShowResults(true);
      } catch (err) {
        console.error("Location search failed", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleInput = (e) => {
    const text = e.target.value;

    setQuery(text);

    if (onChange) {
      onChange(text);
    }
  };

  const handleSelect = (place) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    skipNextSearchRef.current = true;

    setQuery(place.display_name);
    setResults([]);
    setShowResults(false);

    if (onChange) {
      onChange(place.display_name);
    }

    if (onLocationSelect) {
      onLocationSelect({
        venue: place.display_name,
        latitude: Number(place.lat),
        longitude: Number(place.lon),
      });
    }
  };

  const handleClear = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    skipNextSearchRef.current = true;

    setQuery("");
    setResults([]);
    setShowResults(false);

    if (onChange) {
      onChange("");
    }

    if (onLocationSelect) {
      onLocationSelect({
        venue: "",
        latitude: null,
        longitude: null,
      });
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />

        <input
          type="text"
          value={query}
          onChange={handleInput}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-10 py-2 text-sm text-white focus:outline-none focus:border-primary placeholder:text-zinc-500"
        />

        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-zinc-500" />
        )}

        {!loading && query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden">
          {results.map((place) => (
            <button
              key={place.place_id}
              type="button"
              onClick={() => handleSelect(place)}
              className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition border-b border-zinc-800 last:border-b-0"
            >
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 mt-1 text-primary flex-shrink-0" />

                <div className="min-w-0">
                  <div className="text-sm text-white truncate">
                    {place.display_name}
                  </div>

                  <div className="text-xs text-zinc-500">
                    {Number(place.lat).toFixed(5)},{" "}
                    {Number(place.lon).toFixed(5)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;










// Juja, Kiambu, 01001, Kenya

// Latitude: -1.1054509
// Longitude: 37.0126648