import { useEffect, useState } from 'react'
import { 
  Page, PageHeader, PageTitle, PageBody, 
  StatGroup, Stat, 
  Card, CardHeader, CardTitle, CardContent, 
  Button, 
  toast,
  EmptyState
} from '@blinkdotnew/ui'
import { TrendingUp, Flame, Bell, CheckCircle2, Heart, Clock, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { LineChart } from '@blinkdotnew/ui'
import { RECOMMENDATIONS, getProfile, Condition } from '../lib/recommendations'
import { format } from 'date-fns'

export function DashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [moods, setMoods] = useState<any[]>([])
  const [streak, setStreak] = useState(0)
  const [activities, setActivities] = useState<any[]>([])
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchData()
    }
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
    const { error } = await supabase
      .from('activities')
      .update({ completed: true })
      .eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Activity completed! 🎉')
      // Update streak
      const today = new Date().toISOString().split('T')[0]
      const { data: streakData } = await supabase.from('streaks').select('*').eq('user_id', user!.id).maybeSingle()
      if (!streakData) {
        await supabase.from('streaks').insert({ user_id: user!.id, count: 1, last_date: today })
      } else if (streakData.last_date !== today) {
        const lastDate = new Date(streakData.last_date)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const isYesterday = lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]
        const newCount = isYesterday ? streakData.count + 1 : 1
        await supabase.from('streaks').update({ count: newCount, last_date: today }).eq('user_id', user!.id)
      }
      fetchData()
    }
  }

  const chartData = moods.map(m => ({
    date: format(new Date(m.created_at), 'MMM dd'),
    score: m.score
  }))

  const recommendations = profile?.condition ? RECOMMENDATIONS[profile.condition as Condition] : []

  // Split activities
  const pendingActivities = activities.filter(a => !a.completed)
  const completedActivities = activities.filter(a => a.completed)

  if (loading) return <div className="p-8">Loading Dashboard...</div>

  return (
    <Page>
      <PageHeader>
        <PageTitle>Welcome Back, {profile?.display_name || 'User'}</PageTitle>
      </PageHeader>
      <PageBody className="space-y-6">
        <StatGroup>
          <Stat label="Current Streak" value={`${streak} Days`} icon={<Flame className="text-orange-500" />} />
          <Stat label="Today's Tasks" value={`${pendingActivities.length}`} icon={<CheckCircle2 className="text-blue-500" />} />
          <Stat label="Reminders" value={`${reminders.length}`} icon={<Bell className="text-amber-500" />} />
          <Stat label="Wellness Index" value="Good" trend={5.2} icon={<TrendingUp className="text-green-500" />} />
        </StatGroup>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mood Graph */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Mood Trends (Last 7 Entries)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {moods.length > 0 ? (
                <LineChart 
                  data={chartData} 
                  xAxisKey="date" 
                  dataKey="score" 
                  height={250} 
                />
              ) : (
                <EmptyState 
                  title="No mood data yet" 
                  description="Start tracking your daily mood to see trends here."
                />
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Tailored for {profile?.condition || 'You'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <ul className="space-y-4">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="text-sm p-3 bg-secondary/50 rounded-lg border border-border">
                      {rec}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">Set your condition in Profile for tailored tips.</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/profile">Setup Profile</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                Daily Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <ul className="space-y-2">
                  {pendingActivities.map(act => (
                    <li key={act.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                      <span className="text-sm font-medium">{act.title}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-green-500 border-green-500/50 hover:bg-green-500/10"
                        onClick={() => completeActivity(act.id)}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Done
                      </Button>
                    </li>
                  ))}
                  {completedActivities.map(act => (
                    <li key={act.id} className="flex items-center justify-between p-3 rounded-lg opacity-50">
                      <span className="text-sm line-through text-muted-foreground">{act.title}</span>
                      <span className="text-xs text-green-500">✓ Completed</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">No activities yet.</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/activities">Add Activities</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Upcoming Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reminders.length > 0 ? (
                <ul className="space-y-2">
                  {reminders.map(rem => (
                    <li key={rem.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-amber-100 rounded-full">
                          <Bell className="w-3 h-3 text-amber-600" />
                        </div>
                        <span className="text-sm font-medium">{rem.type}</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {rem.time?.substring(0, 5)}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">No reminders set.</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/reminders">Add Reminders</a>
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
