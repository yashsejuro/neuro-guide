import { Lightbulb, ListChecks, BellRing } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const solutions = [
  {
    icon: Lightbulb,
    title: 'Personalized Suggestions',
    description: 'Get AI-powered recommendations tailored to your specific condition — anxiety, ADHD, stress, or depression.',
    color: 'landing-icon-purple'
  },
  {
    icon: ListChecks,
    title: 'Habit Tracking',
    description: 'Track daily activities, build streaks, and develop healthier routines that stick over time.',
    color: 'landing-icon-green'
  },
  {
    icon: BellRing,
    title: 'Smart Reminders',
    description: 'Set reminders for meditation, exercise, hydration, and breaks — with real browser notifications.',
    color: 'landing-icon-blue'
  }
]

export function Solution() {
  const { ref, revealed } = useScrollReveal()

  return (
    <section className="landing-section landing-section-alt">
      <div className="landing-container" ref={ref}>
        <div className={`text-center mb-16 landing-reveal ${revealed ? 'revealed' : ''}`}>
          <div className="landing-divider mb-6" />
          <p className="landing-label">The Solution</p>
          <h2 className="landing-heading">
            Your Personal Mental<br />Wellness System
          </h2>
          <p className="landing-description">
            Neuro Guide brings together everything you need to take control of your mental health.
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 landing-stagger ${revealed ? 'revealed' : ''}`}>
          {solutions.map((item, i) => (
            <div key={i} className="landing-card landing-card-glow">
              <div className={`landing-icon-wrap ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mt-4">{item.title}</h3>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
