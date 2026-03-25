import type { Condition } from './recommendations'

interface MusicPlaylist {
  label: string
  url: string
  emoji: string
}

// Curated YouTube playlists for each condition
const PLAYLISTS: Record<string, MusicPlaylist[]> = {
  Anxiety: [
    { label: 'Calming Rain Sounds', url: 'https://www.youtube.com/watch?v=mPZkdNFkNps', emoji: '🌧️' },
    { label: 'Peaceful Piano', url: 'https://www.youtube.com/watch?v=lFcSrYw-ARY', emoji: '🎹' },
    { label: 'Ocean Waves', url: 'https://www.youtube.com/watch?v=bn9F19Hi1Lk', emoji: '🌊' },
  ],
  ADHD: [
    { label: 'Brown Noise Focus', url: 'https://www.youtube.com/watch?v=RqzGzwTY-6w', emoji: '🔊' },
    { label: 'Lo-Fi Study Beats', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', emoji: '🎧' },
    { label: 'Deep Focus Music', url: 'https://www.youtube.com/watch?v=lTRiuFIWV54', emoji: '🧠' },
  ],
  Depression: [
    { label: 'Uplifting Acoustic', url: 'https://www.youtube.com/watch?v=2OEL4P1Rz04', emoji: '🌅' },
    { label: 'Gentle Morning Music', url: 'https://www.youtube.com/watch?v=1ZYbU82GVz4', emoji: '☀️' },
    { label: 'Nature Sounds', url: 'https://www.youtube.com/watch?v=d0tU18qX3NY', emoji: '🌿' },
  ],
  'Focus Issues': [
    { label: 'White Noise', url: 'https://www.youtube.com/watch?v=nMfPqeZjc2c', emoji: '📡' },
    { label: 'Deep Work Ambience', url: 'https://www.youtube.com/watch?v=co_DNpTMKXk', emoji: '💻' },
    { label: 'Binaural Beats Focus', url: 'https://www.youtube.com/watch?v=WPni755-Krg', emoji: '🎯' },
  ],
  default: [
    { label: 'Lo-Fi Study Beats', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', emoji: '🎧' },
    { label: 'Peaceful Piano', url: 'https://www.youtube.com/watch?v=lFcSrYw-ARY', emoji: '🎹' },
    { label: 'Nature & Rain', url: 'https://www.youtube.com/watch?v=mPZkdNFkNps', emoji: '🌧️' },
  ]
}

export function getPlaylists(condition?: string | null): MusicPlaylist[] {
  if (condition && PLAYLISTS[condition]) return PLAYLISTS[condition]
  return PLAYLISTS.default
}

export function openPlaylist(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}
