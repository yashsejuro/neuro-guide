import React, { useEffect, useState } from 'react'
import { Page, PageHeader, PageTitle, PageBody, Card, CardHeader, CardTitle, CardContent, Button, toast, EmptyState } from '@blinkdotnew/ui'
import { Heart, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { format } from 'date-fns'

export function MoodPage() {
  const { user } = useAuth()
  const [moods, setMoods] = useState<any[]>([])
  const [todayMood, setTodayMood] = useState<number | null>(null)
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
    
    // Check if user already logged mood today
    const exists = data?.find(m => m.created_at.startsWith(today))
    if (exists) setTodayMood(exists.score)
    
    setLoading(false)
  }

  const logMood = async (score: number) => {
    if (!user || todayMood !== null) return
    
    try {
      const { error } = await supabase.from('moods').insert({
        user_id: user.id,
        score
      })
      if (error) throw error
      
      // Update streak
      await updateStreak(user.id)
      
      setTodayMood(score)
      fetchMoods()
      toast.success('Mood logged! Streak updated.')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const updateStreak = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0]
    
    // Get existing streak
    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (!streak) {
      await supabase.from('streaks').insert({ user_id: userId, count: 1, last_date: today })
    } else if (streak.last_date !== today) {
      // Check if last date was yesterday
      const lastDate = new Date(streak.last_date)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const isYesterday = lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]
      
      const newCount = isYesterday ? streak.count + 1 : 1
      await supabase.from('streaks').update({ count: newCount, last_date: today }).eq('user_id', userId)
    }
  }

  if (loading) return <div className="p-8">Loading Moods...</div>

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊']

  return (
    <Page>
      <PageHeader>
        <PageTitle>Daily Mood Tracker</PageTitle>
      </PageHeader>
      <PageBody className="space-y-8">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">How are you feeling today?</CardTitle>
          </CardHeader>
          <CardContent>
            {todayMood === null ? (
              <div className="flex justify-between items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => logMood(s)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-secondary hover:border-primary transition-all group"
                  >
                    <span className="text-4xl group-hover:scale-110 transition-transform">{moodEmojis[s-1]}</span>
                    <span className="text-xs font-medium text-muted-foreground">{s}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-6xl mb-4">{moodEmojis[todayMood-1]}</div>
                <p className="text-lg font-medium">You logged a {todayMood} today!</p>
                <p className="text-sm text-muted-foreground mt-2">Come back tomorrow to keep your streak alive.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Mood History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {moods.length > 0 ? (
              <div className="space-y-4">
                {moods.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{moodEmojis[m.score-1]}</span>
                      <div>
                        <p className="font-medium">Rating: {m.score}/5</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(m.created_at), 'PPPP')}</p>
                      </div>
                    </div>
                    {m.score === 5 && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No entries" description="Log your first mood above to see your history here." />
            )}
          </CardContent>
        </Card>
      </PageBody>
    </Page>
  )
}
