import { Heart, ArrowRight } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'

export function LandingNav() {
  const router = useRouter()

  return (
    <nav className="landing-nav">
      <div className="landing-container flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-purple-400 fill-purple-400" />
          <span className="text-lg font-bold text-white">Neuro Guide</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.navigate({ to: '/login' })}
            className="landing-btn-ghost"
          >
            Log In
          </button>
          <button
            onClick={() => router.navigate({ to: '/signup' })}
            className="landing-btn-primary"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  )
}
