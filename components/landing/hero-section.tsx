'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const [playing, setPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => setVideoError(true))
      setPlaying(true)
    }
  }

  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/50 to-transparent dark:from-brand-950/20"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text content */}
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Stop Wasting Food.{' '}
              <span className="text-brand-600">Start Saving Money.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Smart inventory management for independent restaurants. The average kitchen throws away 4&ndash;10% of the food it buys &mdash; OnPar shows you where, in dollars, and helps you stop it.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-brand-600 hover:bg-brand-700 text-white min-h-[48px] px-8 text-base"
              >
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="min-h-[48px] px-8 text-base"
                onClick={handlePlay}
              >
                See Demo
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-brand-600" aria-hidden="true" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-brand-600" aria-hidden="true" />
                14-day free trial
              </span>
            </div>
          </div>

          {/* Demo video player */}
          <div className="relative hidden lg:block">
            <div className="aspect-[4/3] rounded-xl border shadow-2xl overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-950/40 dark:to-brand-900/20">
              {/* Video element */}
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                loop
                muted
                playsInline
                preload="metadata"
                onError={() => setVideoError(true)}
              >
                <source src="/demo.mp4" type="video/mp4" />
                <source src="/demo.webm" type="video/webm" />
              </video>

              {/* Play button overlay — shows when not playing or video unavailable */}
              {(!playing || videoError) && (
                <button
                  onClick={handlePlay}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-brand-950/80 to-brand-900/60 transition-opacity hover:from-brand-950/70 hover:to-brand-900/50 cursor-pointer"
                  aria-label="Play demo video"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-transform hover:scale-110">
                    <Play className="h-8 w-8 ml-1" fill="currentColor" />
                  </div>
                  <span className="text-white text-lg font-medium">Watch Demo</span>
                  {videoError && (
                    <span className="text-white/60 text-sm">
                      Demo video coming soon
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
