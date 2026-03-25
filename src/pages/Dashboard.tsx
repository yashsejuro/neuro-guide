import { useEffect, useState } from 'react'
import { 
  Page, PageHeader, PageTitle, PageBody, 
  Card, CardHeader, CardTitle, CardContent, 
  Button, 
  toast,
  EmptyState
} from '@blinkdotnew/ui'
import { TrendingUp, Flame, Bell, CheckCircle2, Heart, Clock, Check, Sparkles, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { LineChart } from '@blinkdotnew/ui'
import { STRUCTURED_RECOMMENDATIONS, getProfile, Condition, Suggestion } from '../lib/recommendations'
import { format } from 'date-fns'

// Supportive messages based on streak
function getStreakMessage(streak: number): string {
  if (streak === 0) return 'Start today — every journey begins with one step 🌱'
  if (streak === 1) return 'Great start! You showed up today 💪'
  if (streak <= 3) return "You're building momentum — keep it going! 🔥"
  if (streak <= 7) return "Incredible consistency! You're forming real habits 🌟"
  if (streak <= 14) return "Two weeks strong! Your brain is thanking you 🧠✨"
  return "You're unstoppable! This is real growth 🏆"
}

// Mood insight based on recent data
function getMoodInsight(moods: any[]): { text: string; trend: 'up' | 'down' | 'stable' | 'none' } {
  if (moods.length < 2) return { text: 'Log more moods to see insights here.', trend: 'none' }
  
  const recent = moods.slice(-3)
  const avg = recent.reduce((sum: number, m: any) => sum + m.score, 0) / recent.length
  const prevAvg = moods.length >= 5 
    ? moods.slice(-5, -3).reduce((sum: number, m: any) => sum + m.score, 0) / Math.min(moods.slice(-5, -3).length, 2)
    : avg

  if (avg >= 4) return { text: "You've been feeling great recently — wonderful! 🌞", trend: 'up' }
  if (avg >= 3 && avg > prevAvg) return { text: "Your mood is trending upward — your habits are paying off! 📈", trend: 'up' }
  if (avg >= 3) return { text: "You're doing okay. Small improvements add up over time 🌿", trend: 'stable' }
  if (avg < 3 && avg < prevAvg) return { text: "Tough stretch — be gentle with yourself. Try a suggestion below 💜", trend: 'down' }
  return { text: "It's okay to have low days. Every step forward counts 🤍", trend: 'stable' }
}

// Suggestion card component
function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = suggestion.icon

  return (
    <div 
      className="group p-4 rounded-xl bg-secondary/20 border border-border hover:border-primary/30 transition-all duration-300 cursor-pointer hover:bg-secondary/40"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-secondary/50 ${suggestion.color} shrink-0 group-hover:scale-105 transition-transform`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-foreground">{suggestion.title}</h4>
            {suggestion.duration && (
              <span className="text-[10px] font-medium text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full shrink-0">
                {suggestion.duration}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{suggestion.why}</p>
          
          {expanded && (
            <div className="mt-3 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              {suggestion.steps.map((step, j) => (
                <div key={j} className="flex items-start gap-2 text-xs text-foreground/80">
                  <span className="text-primary font-bold mt-0.5 shrink-0">{j + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={`text-[10px] text-muted-foreground mt-2 text-center transition-opacity ${expanded ? 'opacity-0 h-0' : 'opacity-60'}`}>
        Tap to see steps →
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [moods, setMoods] = useState<any[]>([])
  const [streak, setStreak] = useState(0)
  const [activities, setActivities] = useState<any[]>([])
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [profData, moodData, streakData, actData, remData] = await Promise.all([
        getProfile(user.id),
        supabase.from('moods').select('*').eq('user_id', user.id).order('created_at', { ascending: true }).limit(7),
        supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('activities').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('reminders').select('*').eq('user_id', user.id).order('time', { ascending: true })
      ])

      setProfile(profData)
      setMoods(moodData.data || [])
      setStreak(streakData.data?.count || 0)
      setActivities(actData.data || [])
      setReminders(remData.data || [])
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const completeActivity = async (id: string) => {
    const { error } = await supabase.from('activities').update({ completed: true }).eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Activity completed! 🎉')
      const today = new Date().toISOString().split('T')[0]
      const { data: streakData } = await supabase.from('streaks').select('*').eq('user_id', user!.id).maybeSingle()
      if (!streakData) {
        await supabase.from('streaks').insert({ user_id: user!.id, count: 1, last_date: today })
      } else if (streakData.last_date !== today) {
        const lastDate = new Date(streakData.last_date)
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
        const isYesterday = lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]
        await supabase.from('streaks').update({ count: isYesterday ? streakData.count + 1 : 1, last_date: today }).eq('user_id', user!.id)
      }
      fetchData()
    }
  }

  const chartData = moods.map(m => ({
    date: format(new Date(m.created_at), 'MMM dd'),
    score: m.score
  }))

  const suggestions = profile?.condition 
    ? STRUCTURED_RECOMMENDATIONS[profile.condition as Condition] || []
    : []

  const pendingActivities = activities.filter(a => !a.completed)
  const completedActivities = activities.filter(a => a.completed)
  const moodInsight = getMoodInsight(moods)

  const moodLabels: Record<number, string> = { 1: 'Low', 2: 'Below Avg', 3: 'Okay', 4: 'Good', 5: 'Great' }
  const latestMood = moods.length > 0 ? moods[moods.length - 1]?.score : null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your wellness dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <Page>
      <PageHeader>
        <div>
          <PageTitle>Welcome back, {profile?.display_name || 'there'} 👋</PageTitle>
          <p className="text-sm text-muted-foreground mt-1">{getStreakMessage(streak)}</p>
        </div>
      </PageHeader>
      <PageBody className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="group hover:border-orange-500/30 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{streak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:border-blue-500/30 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingActivities.length}</p>
                <p className="text-xs text-muted-foreground">Pending Tasks</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:border-amber-500/30 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reminders.length}</p>
                <p className="text-xs text-muted-foreground">Reminders</p>
              </div>
            </CardContent>
          </Card>
          <Card className="group hover:border-rose-500/30 transition-colors">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{latestMood ? moodLabels[latestMood] : '—'}</p>
                <p className="text-xs text-muted-foreground">Latest Mood</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mood Graph + Suggestions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mood Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Mood Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {moods.length > 0 ? (
                <div>
                  {/* Y-axis labels */}
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1 px-1">
                    <span>Scale: 1 (Low) → 5 (Great)</span>
                    <span>Last 7 entries</span>
                  </div>
                  <LineChart 
                    data={chartData} 
                    xAxisKey="date" 
                    dataKey="score" 
                    height={220} 
                  />
                  {/* Mood insight */}
                  <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`w-4 h-4 ${
                        moodInsight.trend === 'up' ? 'text-green-500' : 
                        moodInsight.trend === 'down' ? 'text-red-400' : 'text-muted-foreground'
                      }`} />
                      <p className="text-sm text-muted-foreground">{moodInsight.text}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState 
                  title="No mood data yet" 
                  description="Start tracking your daily mood to see trends and insights here."
                />
              )}
            </CardContent>
          </Card>

          {/* Personalized Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                {profile?.condition ? `For ${profile.condition}` : 'Suggestions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.map((sug, i) => (
                    <SuggestionCard key={i} suggestion={sug} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Get personalized guidance</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Set your condition in Profile to unlock tailored techniques.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/profile" className="inline-flex items-center gap-1">
                      Setup Profile <ArrowRight className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activities + Reminders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Activities */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  Today's Activities
                </CardTitle>
                {pendingActivities.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {completedActivities.length}/{activities.length} done
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <ul className="space-y-2">
                  {pendingActivities.map(act => (
                    <li key={act.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border hover:border-blue-500/20 transition-colors group">
                      <span className="text-sm font-medium">{act.title}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-green-500 border-green-500/30 hover:bg-green-500/10 opacity-70 group-hover:opacity-100 transition-opacity"
                        onClick={() => completeActivity(act.id)}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Done
                      </Button>
                    </li>
                  ))}
                  {completedActivities.map(act => (
                    <li key={act.id} className="flex items-center justify-between p-3 rounded-xl opacity-40">
                      <span className="text-sm line-through text-muted-foreground">{act.title}</span>
                      <span className="text-[10px] text-green-500 font-medium">✓ Done</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <p className="text-sm text-muted-foreground">No activities yet — start small!</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/activities">Add Your First Task</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Scheduled Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reminders.length > 0 ? (
                <ul className="space-y-2">
                  {reminders.map(rem => (
                    <li key={rem.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border hover:border-amber-500/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-amber-500/10 rounded-lg">
                          <Bell className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <span className="text-sm font-medium">{rem.type}</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <Clock className="w-3 h-3" />
                        {rem.time?.substring(0, 5)}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <p className="text-sm text-muted-foreground">No reminders set yet.</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/reminders">Schedule a Reminder</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </Page>
  )
}
