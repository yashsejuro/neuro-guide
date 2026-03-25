import { UserCircle, Lightbulb, TrendingUp } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const steps = [
  {
    number: '01',
    icon: UserCircle,
    title: 'Input Your State',
    description: 'Tell us about your condition — anxiety, ADHD, stress, or depression. Set up your profile in seconds.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border border-purple-500/20'
  },
  {
    number: '02',
    icon: Lightbulb,
    title: 'Get Personalized Suggestions',
    description: 'Receive tailored recommendations, activities, and coping strategies specific to your needs.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border border-emerald-500/20'
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Track & Improve Daily',
    description: 'Log moods, complete activities, build streaks, and watch your wellness improve over time.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border border-blue-500/20'
  }
]

export function HowItWorks() {
  const { ref, revealed } = useScrollReveal()

  return (
    <section className="landing-section landing-section-alt">
      <div className="landing-container" ref={ref}>
        <div className={`text-center mb-16 landing-reveal ${revealed ? 'revealed' : ''}`}>
          <div className="landing-divider mb-6" />
          <p className="landing-label">How It Works</p>
          <h2 className="landing-heading">
            Get Started in 3 Simple Steps
          </h2>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 landing-stagger ${revealed ? 'revealed' : ''}`}>
          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="landing-step-connector" />
              )}

              <div className={`landing-step-icon ${step.bg}`}>
                <step.icon className={`w-10 h-10 ${step.color}`} />
              </div>
              <div className={`text-xs font-bold tracking-[0.2em] ${step.color} mb-2`}>
                STEP {step.number}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
