import React, { useEffect, useState } from 'react'
import { 
  Page, PageHeader, PageTitle, PageBody, 
  StatGroup, Stat, 
  Card, CardHeader, CardTitle, CardContent, 
  Button, 
  toast,
  EmptyState
} from '@blinkdotnew/ui'
import { LayoutDashboard, TrendingUp, Flame, Bell, CheckCircle2, Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { LineChart } from '@blinkdotnew/ui'
import { RECOMMENDATIONS, getProfile, Condition } from '../lib/recommendations'
import { format, subDays, startOfDay } from 'date-fns'

export function DashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [moods, setMoods] = useState<any[]>([])
  const [streak, setStreak] = useState(0)
  const [activities, setActivities] = useState<any[]>([])
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
      const [profData, moodData, streakData, actData] = await Promise.all([
        getProfile(user.id),
        supabase.from('moods').select('*').eq('user_id', user.id).order('created_at', { ascending: true }).limit(7),
        supabase.from('streaks').select('*').eq('user_id', user.id).single(),
        supabase.from('activities').select('*').eq('user_id', user.id).eq('completed', false).limit(5)
      ])

      setProfile(profData)
      setMoods(moodData.data || [])
      setStreak(streakData.data?.count || 0)
      setActivities(actData.data || [])
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const chartData = moods.map(m => ({
    date: format(new Date(m.created_at), 'MMM dd'),
    score: m.score
  }))

  const recommendations = profile?.condition ? RECOMMENDATIONS[profile.condition as Condition] : []

  if (loading) return <div className="p-8">Loading Dashboard...</div>

  return (
    <Page>
      <PageHeader>
        <PageTitle>Welcome Back, {profile?.display_name || 'User'}</PageTitle>
      </PageHeader>
      <PageBody className="space-y-6">
        <StatGroup>
          <Stat label="Current Streak" value={`${streak} Days`} icon={<Flame className="text-orange-500" />} />
          <Stat label="Today's Tasks" value={`${activities.length}`} icon={<CheckCircle2 className="text-blue-500" />} />
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
          {/* Quick Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <ul className="space-y-3">
                  {activities.map(act => (
                    <li key={act.id} className="flex items-center justify-between p-2 border-b last:border-0">
                      <span className="text-sm">{act.title}</span>
                      <Button variant="ghost" size="sm">Done</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">All caught up! Add more in Activities.</p>
              )}
            </CardContent>
          </Card>

          {/* Reminders placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">Feature coming soon: Desktop notifications for breaks and meditation.</p>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </Page>
  )
}
