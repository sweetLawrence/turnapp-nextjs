"use client"

import Link from 'next/link';
import { Instagram, Mail, Smartphone, X } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="glass mt-12 sm:mt-16 md:mt-20">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-6 xl:px-8 2xl:px-12 py-8 sm:py-10 md:py-12">
        <div className="border-t border-white/10 pt-8 sm:pt-10 md:pt-12"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="space-y-3 sm:space-y-4">
            <Link href="/" className="inline-block group">
              <span className="text-xl sm:text-2xl font-bold text-white brand-logo tracking-wide smooth-transition group-hover:text-primary">
                TURN APP
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Explore a world of events and unique experiences.
            </p>
          </div>

          {/* Download App */}
          <div>
            <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Download Our App</h3>
            <div className="space-y-2 sm:space-y-3">
              <a 
                href="https://apps.apple.com/ke/app/turn-app/id1660211908"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full glass-light rounded-lg px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 hover:bg-white/10 smooth-transition border border-white/10 group"
              >
                <div className="bg-primary/20 p-1.5 sm:p-2 rounded-lg group-hover:bg-primary smooth-transition">
                  <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-primary group-hover:text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Download on the</p>
                  <p className="text-xs sm:text-sm font-semibold text-white">App Store</p>
                </div>
              </a>
              <a 
                href="https://play.google.com/store/apps/details?id=com.turnapp.online"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full glass-light rounded-lg px-3 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 hover:bg-white/10 smooth-transition border border-white/10 group"
              >
                <div className="bg-primary/20 p-1.5 sm:p-2 rounded-lg group-hover:bg-primary smooth-transition">
                  <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-primary group-hover:text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Get it on</p>
                  <p className="text-xs sm:text-sm font-semibold text-white">Google Play</p>
                </div>
              </a>
            </div>
          </div>

          {/* Support & Connect */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
            <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6">
              <li>
                <button className="text-xs sm:text-sm text-muted-foreground hover:text-primary smooth-transition">
                  Help Center
                </button>
              </li>
              <li>
                <button className="text-xs sm:text-sm text-muted-foreground hover:text-primary smooth-transition">
                  Contact Us
                </button>
              </li>
              <li>
                <button className="text-xs sm:text-sm text-muted-foreground hover:text-primary smooth-transition">
                  FAQs
                </button>
              </li>
              <li>
                <button className="text-xs sm:text-sm text-muted-foreground hover:text-primary smooth-transition">
                  Refund Policy
                </button>
              </li>
            </ul>
            
            <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Connect With Us</h3>
            <div className="flex gap-2 sm:gap-3">
              <a 
                href="https://www.instagram.com/turn_app"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 sm:p-2 rounded-lg bg-muted hover:bg-primary smooth-transition"
              >
                <Instagram className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>
              <a 
                href="mailto:eventsturnapp@gmail.com"
                className="p-1.5 sm:p-2 rounded-lg bg-muted hover:bg-primary smooth-transition"
              >
                <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © 2026 <span className="brand-logo">TURN APP</span> Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};