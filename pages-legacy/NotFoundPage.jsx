"use client"

import { useEffect } from 'react';
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Home, ArrowLeft, Search, AlertTriangle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.warn(`404 - Page not found: ${pathname}`);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-red-600/5 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-600/5 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center">
        <div className="relative mb-8">
          <div className="text-[120px] sm:text-[180px] font-extrabold leading-none tracking-tighter select-none">
            <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent animate-pulse">
              4
            </span>
            <span className="bg-gradient-to-r from-zinc-500 via-zinc-400 to-zinc-600 bg-clip-text text-transparent">
              0
            </span>
            <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-600 bg-clip-text text-transparent animate-pulse delay-150">
              4
            </span>
          </div>

          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-red-500/10 blur-2xl animate-pulse" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl animate-pulse delay-300" />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
            <div className="absolute top-0 left-[10%] w-2 h-2 rounded-full bg-red-500/30 animate-bounce" />
            <div className="absolute bottom-0 right-[15%] w-3 h-3 rounded-full bg-blue-500/30 animate-bounce delay-100" />
            <div className="absolute top-[30%] right-[5%] w-1.5 h-1.5 rounded-full bg-purple-500/30 animate-bounce delay-200" />
            <div className="absolute bottom-[40%] left-[5%] w-2 h-2 rounded-full bg-emerald-500/30 animate-bounce delay-300" />
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Search className="h-4 w-4 text-zinc-400" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
          Oops! Page not found
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-md mx-auto mb-2">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="text-zinc-500 text-sm">
          Try checking the URL or navigate back to the homepage.
        </p>

        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent mx-auto my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full sm:w-auto border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-600/20 transition-all"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800/50">
          <p className="text-xs text-zinc-500 mb-4">Or try these quick links:</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/events"
              className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-zinc-800/50"
            >
              Browse Events
            </Link>
            <span className="text-zinc-700">•</span>
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-zinc-800/50"
            >
              Sign In
            </Link>
            <span className="text-zinc-700">•</span>
            <Link
              href="/register"
              className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-zinc-800/50"
            >
              Create Account
            </Link>
            <span className="text-zinc-700">•</span>
            <Link
              href="/affiliate/learn-more"
              className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1 rounded-lg hover:bg-zinc-800/50"
            >
              Become an Affiliate
            </Link>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-600">
          <Sparkles className="h-3 w-3 text-zinc-500" />
          <span>TurnApp</span>
          <span className="text-zinc-700">•</span>
          <span>Event Management Platform</span>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;