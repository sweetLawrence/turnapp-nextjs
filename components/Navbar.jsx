"use client"

import Link from 'next/link'
import { Menu, X, LayoutDashboard, Compass } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { authService } from '@/lib/services/authService';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="group">
            <span className="text-lg sm:text-xl font-bold text-white brand-logo tracking-wide smooth-transition group-hover:text-primary">
              TURN APP
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* STYLED EXPLORE LINK */}
            <Link 
              href="/events" 
              className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-white/70 
                         bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] hover:shadow-[0_0_10px_rgba(255,255,255,0.05)]
                         transition-all duration-300 hover:-translate-y-0.5 group"
            >
              <Compass className="h-4 w-4 text-white/70 group-hover:text-white/90 group-hover:rotate-45 transition-all duration-300" />
              <span>Discover</span>
            </Link>

            {isAuthenticated ? (
              /* Dashboard Button - When Logged In */
              <Link href="/dashboard">
                <Button 
                  variant="default" 
                  className="hidden sm:flex bg-gradient-red hover:opacity-90 text-white red-glow smooth-transition text-xs sm:text-sm gap-2"
                  size="sm"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            ) : (
              /* Login/Register Buttons - When Not Logged In */
              <>
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    className="hidden sm:flex border-white/20 text-white hover:bg-white/10 smooth-transition text-xs sm:text-sm"
                    size="sm"
                  >
                    Login
                  </Button>
                </Link>
                
                <Link href="/register">
                  <Button 
                    variant="default" 
                    className="hidden sm:flex bg-gradient-red hover:opacity-90 text-white red-glow smooth-transition text-xs sm:text-sm"
                    size="sm"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button 
              size="icon" 
              variant="ghost"
              className="sm:hidden h-8 w-8 text-white hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden py-3 sm:py-4 border-t border-white/10 animate-fadeIn bg-black/40 backdrop-blur-md rounded-b-lg">
            <div className="flex flex-col gap-2 px-2">
              {/* <Link 
                href="/" 
                className="text-sm text-white hover:text-primary smooth-transition font-medium py-2 px-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link> */}
              
              <Link 
                href="/events" 
                className="flex items-center justify-center gap-2 text-sm text-white hover:text-white/80 smooth-transition font-medium py-2 px-2 w-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Compass className="h-4 w-4" />
                Discover
              </Link>
              
              <div className="pt-1">
                {isAuthenticated ? (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" className="bg-gradient-red text-white w-full text-sm gap-2" size="sm">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full text-sm" size="sm">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="default" className="bg-gradient-red text-white w-full text-sm" size="sm">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};