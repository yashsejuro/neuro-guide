import { ArrowRight, Sparkles } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'

export function Hero() {
  const router = useRouter()

  return (
    <section className="landing-hero">
      {/* Gradient orbs */}
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />

      <div className="landing-container relative z-10 text-center py-24 md:py-36">
        <div className="landing-badge">
          <Sparkles className="w-4 h-4" />
          Your Mental Wellness Companion
        </div>

        <h1 className="landing-title">
          Build Focus, Reduce Stress,
          <br />
          <span className="landing-title-gradient">Improve Daily Habits</span>
        </h1>

        <p className="landing-subtitle">
          Neuro Guide helps you understand your mental patterns, build healthier habits,
          and stay on track with personalized suggestions — all in one calm, focused space.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <button
            onClick={() => router.navigate({ to: '/signup' })}
            className="landing-btn-primary landing-btn-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="landing-btn-ghost landing-btn-lg"
          >
            Learn More
          </button>
        </div>

        {/* Stats strip */}
        <div className="landing-stats">
          <div className="landing-stat">
            <div className="landing-stat-number">5+</div>
            <div className="landing-stat-label">Wellness Modules</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-number">24/7</div>
            <div className="landing-stat-label">Smart Reminders</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat-number">100%</div>
            <div className="landing-stat-label">Privacy First</div>
          </div>
        </div>
      </div>
    </section>
  )
}
