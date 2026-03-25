import { useEffect, useState } from 'react'
import { Page, PageHeader, PageTitle, PageBody, Card, CardHeader, CardTitle, CardContent, toast, EmptyState } from '@blinkdotnew/ui'
import { Heart, Star, TrendingUp, Calendar } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format } from 'date-fns'

const moodConfig = [
  { score: 1, emoji: '😢', label: 'Struggling', color: 'border-red-400/40 hover:border-red-400 hover:bg-red-500/5', activeColor: 'bg-red-500/10 border-red-400' },
  { score: 2, emoji: '😕', label: 'Low', color: 'border-orange-400/40 hover:border-orange-400 hover:bg-orange-500/5', activeColor: 'bg-orange-500/10 border-orange-400' },
  { score: 3, emoji: '😐', label: 'Okay', color: 'border-yellow-400/40 hover:border-yellow-400 hover:bg-yellow-500/5', activeColor: 'bg-yellow-500/10 border-yellow-400' },
  { score: 4, emoji: '🙂', label: 'Good', color: 'border-green-400/40 hover:border-green-400 hover:bg-green-500/5', activeColor: 'bg-green-500/10 border-green-400' },
  { score: 5, emoji: '😊', label: 'Great', color: 'border-emerald-400/40 hover:border-emerald-400 hover:bg-emerald-500/5', activeColor: 'bg-emerald-500/10 border-emerald-400' },
]

function getMoodMessage(score: number): string {
  switch (score) {
    case 1: return "It's okay to have tough days. You showed up, and that matters. 💜"
    case 2: return "A bit low today — be gentle with yourself. Tomorrow is a new chance. 🤍"
    case 3: return "A steady day. Keep doing what you're doing! 🌿"
    case 4: return "Looking good! Keep riding this positive wave. ☀️"
    case 5: return "Amazing! You're thriving today — celebrate that! 🌟"
    default: return "Thanks for checking in!"
  }
}

export function MoodPage() {
  const { user } = useAuth()
  const [moods, setMoods] = useState<any[]>([])
  const [todayMood, setTodayMood] = useState<number | null>(null)
  const [hoveredScore, setHoveredScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchMoods()
  }, [user])

  const fetchMoods = async () => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    
    const { data } = await supabase
      .from('moods')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    setMoods(data || [])
    
    const exists = data?.find(m => m.created_at.startsWith(today))
    if (exists) setTodayMood(exists.score)
    else setTodayMood(null)
    
    setLoading(false)
  }

  const logMood = async (score: number) => {
    if (!user || todayMood !== null) return
    
    try {
      const { error } = await supabase.from('moods').insert({ user_id: user.id, score })
      if (error) throw error
      
      // Update streak
      const today = new Date().toISOString().split('T')[0]
      const { data: streak } = await supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle()
      
      if (!streak) {
        await supabase.from('streaks').insert({ user_id: user.id, count: 1, last_date: today })
      } else if (streak.last_date !== today) {
        const lastDate = new Date(streak.last_date)
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
        const isYesterday = lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]
        await supabase.from('streaks').update({ count: isYesterday ? streak.count + 1 : 1, last_date: today }).eq('user_id', user.id)
      }
      
      setTodayMood(score)
      fetchMoods()
      toast.success('Mood logged! Streak updated. 🎉')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // Calculate stats
  const avgMood = moods.length > 0 
    ? (moods.reduce((sum, m) => sum + m.score, 0) / moods.length).toFixed(1)
    : '—'
  const bestDay = moods.length > 0
    ? moods.reduce((best, m) => m.score > best.score ? m : best, moods[0])
    : null
  const totalEntries = moods.length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your mood data...</p>
        </div>
      </div>
    )
  }

  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Mood Tracker</PageTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Track how you feel each day. Small check-ins lead to big insights.
          </p>
        </div>
      </PageHeader>
      <PageBody className="space-y-8">
        {/* Today's Mood Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">
              {todayMood === null ? 'How are you feeling right now?' : "Today's Check-in"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayMood === null ? (
              <div>
                <div className="flex justify-between items-stretch gap-3">
                  {moodConfig.map(({ score, emoji, label, color }) => (
                    <button
                      key={score}
                      onClick={() => logMood(score)}
                      onMouseEnter={() => setHoveredScore(score)}
                      onMouseLeave={() => setHoveredScore(null)}
                      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border ${color} transition-all duration-200`}
                    >
                      <span className={`text-4xl transition-transform duration-200 ${hoveredScore === score ? 'scale-125' : ''}`}>
                        {emoji}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">{label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Select the emoji that best matches your current state
                </p>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="text-6xl">{moodConfig[todayMood - 1]?.emoji}</div>
                <div>
                  <p className="text-lg font-semibold">{moodConfig[todayMood - 1]?.label}</p>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                    {getMoodMessage(todayMood)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground opacity-60 pt-2">
                  Come back tomorrow to keep your tracking streak going.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {moods.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{avgMood}</p>
                <p className="text-xs text-muted-foreground">Average Mood</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {bestDay ? moodConfig[bestDay.score - 1]?.emoji : '—'}
                </p>
                <p className="text-xs text-muted-foreground">Best Recent Mood</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-5 h-5 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{totalEntries}</p>
                <p className="text-xs text-muted-foreground">Total Check-ins</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mood History */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Mood History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {moods.length > 0 ? (
              <div className="space-y-3">
                {moods.map((m) => {
                  const config = moodConfig[m.score - 1]
                  return (
                    <div 
                      key={m.id} 
                      className={`flex items-center justify-between p-4 rounded-xl border ${config?.activeColor || 'border-border bg-secondary/20'} transition-all hover:scale-[1.01]`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{config?.emoji}</span>
                        <div>
                          <p className="font-medium">{config?.label} — {m.score}/5</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(m.created_at), 'EEEE, MMMM d, yyyy')}</p>
                        </div>
                      </div>
                      {m.score === 5 && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState title="No entries yet" description="Log your first mood above to start building your history." />
            )}
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  )
}
