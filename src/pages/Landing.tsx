import { useAuth } from '../hooks/useAuth'
import { useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { LandingNav } from '../components/landing/Nav'
import { Hero } from '../components/landing/Hero'
import { Problem } from '../components/landing/Problem'
import { Solution } from '../components/landing/Solution'
import { Features } from '../components/landing/Features'
import { HowItWorks } from '../components/landing/HowItWorks'
import { CTA } from '../components/landing/CTA'
import { LandingFooter } from '../components/landing/Footer'

export function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.navigate({ to: '/dashboard' })
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a12]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    )
  }

  if (user) return null

  return (
    <div className="landing-page">
      <LandingNav />
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <HowItWorks />
      <CTA />
      <LandingFooter />
    </div>
  )
}
