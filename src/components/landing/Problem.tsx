import { AlertTriangle, Smartphone, Brain } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const problems = [
  {
    icon: Brain,
    title: 'Lack of Focus',
    description: 'Constant distractions make it impossible to concentrate on tasks that matter most to you.'
  },
  {
    icon: AlertTriangle,
    title: 'Anxiety & Stress',
    description: 'Overwhelming workloads and social pressure take a toll on your mental health every single day.'
  },
  {
    icon: Smartphone,
    title: 'Doomscrolling',
    description: 'Endless social media feeds drain your energy and leave you feeling worse than before.'
  }
]

export function Problem() {
  const { ref, revealed } = useScrollReveal()

  return (
    <section className="landing-section">
      <div className="landing-container" ref={ref}>
        <div className={`text-center mb-16 landing-reveal ${revealed ? 'revealed' : ''}`}>
          <p className="landing-label">The Problem</p>
          <h2 className="landing-heading">
            Modern Life is Draining<br />Your Mental Energy
          </h2>
          <p className="landing-description">
            Most people struggle with these challenges daily — but rarely have a system to manage them.
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 landing-stagger ${revealed ? 'revealed' : ''}`}>
          {problems.map((item, i) => (
            <div key={i} className="landing-card landing-card-problem">
              <div className="landing-icon-wrap landing-icon-red">
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
