import { Heart } from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-400 fill-purple-400" />
            <span className="font-semibold text-white">Neuro Guide</span>
          </div>
          <p className="text-sm text-gray-500">
            Built with care for your mental wellness.
          </p>
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Neuro Guide. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
