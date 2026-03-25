import { Headphones, ExternalLink, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { getPlaylists, openPlaylist } from '../lib/music-links'

export function MusicButton({ condition }: { condition?: string | null }) {
  const [open, setOpen] = useState(false)
  const playlists = getPlaylists(condition)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="ng-music-btn"
      >
        <Headphones className="w-4 h-4" />
        <span>Focus Music</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="ng-music-dropdown">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider px-3 pt-2 pb-1">
              {condition ? `For ${condition}` : 'Focus Playlists'}
            </p>
            {playlists.map((p, i) => (
              <button
                key={i}
                onClick={() => { openPlaylist(p.url); setOpen(false) }}
                className="ng-music-item"
              >
                <span className="text-base">{p.emoji}</span>
                <span className="flex-1 text-left text-sm">{p.label}</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
