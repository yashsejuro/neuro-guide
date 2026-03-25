import { BarChart3, CheckSquare, Bell, Flame, LayoutDashboard } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const featuresTop = [
  {
    icon: BarChart3,
    title: 'Mood Tracking',
    description: 'Log your mood daily and visualize trends over time with beautiful interactive charts.',
    gradient: 'from-rose-500/20 to-orange-500/20',
    iconColor: 'text-rose-400'
  },
  {
    icon: CheckSquare,
    title: 'Activity Tracker',
    description: 'Create daily tasks, mark them done, and build a consistent routine for better wellbeing.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400'
  },
  {
    icon: Bell,
    title: 'Reminder System',
    description: 'Browser notifications for meditation, exercise, hydration, and healthy breaks.',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    iconColor: 'text-amber-400'
  }
]

const featuresBottom = [
  {
    icon: Flame,
    title: 'Streak System',
    description: 'Stay motivated with daily streaks that reward your consistency and progress.',
    gradient: 'from-orange-500/20 to-red-500/20',
    iconColor: 'text-orange-400'
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard Overview',
    description: 'See everything at a glance — mood trends, tasks, reminders, and wellness score.',
    gradient: 'from-purple-500/20 to-indigo-500/20',
    iconColor: 'text-purple-400'
  }
]

function FeatureCard({ feature }: { feature: typeof featuresTop[0] }) {
  return (
    <div className="landing-card group">
      <div className={`absolute inset-0 rounded-[1.25rem] bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative z-10">
        <div className={`landing-feature-icon ${feature.iconColor}`}>
          <feature.icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">{feature.description}</p>
      </div>
    </div>
  )
}

export function Features() {
  const { ref, revealed } = useScrollReveal()

  return (
    <section id="features" className="landing-section">
      <div className="landing-container" ref={ref}>
        <div className={`text-center mb-16 landing-reveal ${revealed ? 'revealed' : ''}`}>
          <p className="landing-label">Features</p>
          <h2 className="landing-heading">
            Everything You Need<br />in One Place
          </h2>
          <p className="landing-description">
            A complete toolkit designed to help you build better mental habits daily.
          </p>
        </div>

        {/* Row 1: 3 cards */}
        <div className={`landing-features-grid landing-stagger ${revealed ? 'revealed' : ''}`}>
          {featuresTop.map((feature, i) => (
            <FeatureCard key={i} feature={feature} />
          ))}
        </div>

        {/* Row 2: 2 cards centered */}
        <div className={`landing-features-bottom landing-stagger ${revealed ? 'revealed' : ''}`}>
          {featuresBottom.map((feature, i) => (
            <FeatureCard key={i} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
