import { ArrowRight } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'
import { useScrollReveal } from '../../hooks/useScrollReveal'

export function CTA() {
  const router = useRouter()
  const { ref, revealed } = useScrollReveal()

  return (
    <section className="landing-section" ref={ref}>
      <div className="landing-container">
        <div className={`landing-cta-box landing-reveal ${revealed ? 'revealed' : ''}`}>
          {/* Glow orbs */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-500/15 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/15 rounded-full blur-[100px]" />

          <div className="relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Ready to Take Control?
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed">
              Join Neuro Guide and start building healthier mental habits today.
              <br className="hidden sm:block" />
              No credit card required. Free forever.
            </p>
            <button
              onClick={() => router.navigate({ to: '/signup' })}
              className="landing-btn-primary landing-btn-lg"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
