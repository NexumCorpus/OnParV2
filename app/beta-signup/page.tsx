'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChefHat } from 'lucide-react'

export default function BetaSignupPage() {
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">OnPar</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">Join the OnPar Beta</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Be among the first Charleston restaurants to reduce food waste and save money.
          </p>
          
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <form className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="owner@restaurant.com"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90"
                onClick={(e) => {
                  e.preventDefault()
                  alert('Beta signup submitted! We will contact you soon.')
                }}
              >
                Apply for Beta Access
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}