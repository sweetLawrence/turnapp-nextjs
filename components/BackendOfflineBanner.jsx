"use client"

import {
  Heart,
  Instagram,
  Music2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const MAINTENANCE_MODE = process.env.REACT_APP_MAINTENANCE_MODE === 'true';

function TurnLogo() {
  return (
    <span className="brand-logo text-xl font-bold tracking-wide text-white sm:text-2xl" aria-label="Turn App">
      TURN APP
    </span>
  );
}

function BackendOfflineBanner({ children }) {
  if (!MAINTENANCE_MODE) {
    return children;
  }

  return (
    <main className="h-[100dvh] overflow-hidden bg-black p-3 text-white sm:p-5" aria-live="polite">
      <div className="mx-auto flex h-full max-w-[1240px] flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#050505] shadow-[0_20px_70px_rgba(220,20,60,0.12)]">
        <header className="flex shrink-0 justify-center px-6 pb-2 pt-5 sm:pt-7">
          <TurnLogo />
        </header>

        <section className="grid min-h-0 flex-1 items-center gap-1 px-6 sm:px-10 lg:grid-cols-2 lg:px-16">
          <div className="mx-auto w-full max-w-[480px] text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[0.7rem] font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5 fill-primary text-primary" />
              Polishing a few things…
            </div>

            <h1 className="text-[2.15rem] font-bold leading-[1.12] tracking-[-0.04em] sm:text-[2.7rem] lg:text-[clamp(2.4rem,3.4vw,3.3rem)]">
              Oops! 🚧<br />We’re making a few<br />
              <span className="text-primary">improvements.</span>
            </h1>

            <div className="mx-auto mt-4 max-w-[430px] space-y-3 text-sm leading-6 text-white/60 sm:text-base">
              <p>Our website is temporarily unavailable while we make a few improvements behind the scenes.</p>
              <p>We’ll be back online shortly.</p>
            </div>

            <div className="mx-auto my-3 flex max-w-[190px] items-center gap-3 text-primary">
              <span className="h-px flex-1 bg-primary/30" />
              <Heart className="h-4 w-4 fill-primary" />
              <span className="h-px flex-1 bg-primary/30" />
            </div>

            <p className="mx-auto max-w-[430px] text-sm leading-6 text-white/60 sm:text-base">
              Thanks for your patience—we’ll have you discovering your next experience again soon. 💜
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-gradient-red red-glow mt-5 inline-flex min-w-[225px] items-center justify-center gap-3 rounded-xl px-7 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:opacity-90"
            >
              <RefreshCw className="h-5 w-5" />
              Refresh Page
            </button>
          </div>

          <div className="relative mx-auto hidden h-full min-h-0 w-full items-center justify-center lg:flex">
            <div className="absolute aspect-square w-[72%] rounded-full bg-primary/5" />
            <img
              src="/images/maintenance-mascot-red.png"
              alt="A friendly Turn App construction mascot working beside red maintenance equipment"
              className="relative z-10 max-h-[min(56vh,560px)] w-full object-contain"
            />
          </div>
        </section>

        <footer className="mx-6 flex shrink-0 flex-col items-center justify-center gap-2 border-t border-white/10 py-3 text-xs text-muted-foreground sm:mx-12 sm:flex-row sm:gap-5 lg:mx-20">
          <span className="flex items-center gap-2"><Heart className="h-4 w-4 fill-primary text-primary" /> We appreciate your patience.</span>
          <span className="hidden h-4 w-px bg-white/10 sm:block" />
          <span className="flex items-center gap-4 text-primary">
            <Instagram className="h-4 w-4" />
            <Music2 className="h-4 w-4" />
            <span className="font-semibold">@turnapp_</span>
          </span>
        </footer>
      </div>
    </main>
  );
}

export default BackendOfflineBanner;
