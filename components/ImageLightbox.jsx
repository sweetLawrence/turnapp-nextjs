"use client"

import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';

export const ImageLightbox = ({ isOpen, onClose, imageUrl, title }) => {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setZoom(1); // Reset zoom when opening
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${title || 'event-image'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button
          size="icon"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleZoomOut();
          }}
          className="bg-black/50 border-white/20 text-white hover:bg-black/70"
          disabled={zoom <= 0.5}
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        
        <Button
          size="icon"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleZoomIn();
          }}
          className="bg-black/50 border-white/20 text-white hover:bg-black/70"
          disabled={zoom >= 3}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="bg-black/50 border-white/20 text-white hover:bg-black/70"
        >
          <Download className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={onClose}
          className="bg-black/50 border-white/20 text-white hover:bg-black/70"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Zoom indicator */}
      {zoom !== 1 && (
        <div className="absolute top-4 left-4 bg-black/50 border border-white/20 text-white px-3 py-1.5 rounded-lg text-sm">
          {Math.round(zoom * 100)}%
        </div>
      )}

      {/* Image */}
      <div 
        className="relative max-w-[95vw] max-h-[95vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={title || 'Event image'}
          className="w-auto h-auto max-w-full max-h-[95vh] object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>

      {/* Title */}
      {title && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 border border-white/20 text-white px-4 py-2 rounded-lg text-sm max-w-[90vw] truncate">
          {title}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-black/50 border border-white/20 text-white/70 px-3 py-1.5 rounded-lg text-xs">
        Press ESC to close
      </div>
    </div>
  );
};
