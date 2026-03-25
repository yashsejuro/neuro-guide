import { useEffect, useState } from 'react'
import { Page, PageHeader, PageTitle, PageActions, PageBody, Card, CardContent, Button, Input, toast, EmptyState } from '@blinkdotnew/ui'
import { Plus, Check, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { addXP, XP_PER_TASK } from '../lib/gamification'

export function ActivitiesPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<any[]>([])
  const [newActivity, setNewActivity] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchActivities()
  }, [user])

  const fetchActivities = async () => {
    if (!user) return
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setActivities(data || [])
    setLoading(false)
  }

  const addActivity = async () => {
    if (!user || !newActivity.trim()) return
    const { error } = await supabase.from('activities').insert({
      user_id: user.id,
      title: newActivity.trim()
    })
    if (error) toast.error(error.message)
    else {
      setNewActivity('')
      fetchActivities()
      toast.success('Activity added')
    }
  }

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('activities')
      .update({ completed: !currentStatus })
      .eq('id', id)
    if (error) toast.error(error.message)
    else {
      if (!currentStatus) {
        // Just completed it - update streak
        const today = new Date().toISOString().split('T')[0]
        const { data: streak } = await supabase.from('streaks').select('*').eq('user_id', user!.id).maybeSingle()
        
        if (!streak) {
          await supabase.from('streaks').insert({ user_id: user!.id, count: 1, last_date: today })
        } else if (streak.last_date !== today) {
          const lastDate = new Date(streak.last_date)
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const isYesterday = lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]
          const newCount = isYesterday ? streak.count + 1 : 1
          await supabase.from('streaks').update({ count: newCount, last_date: today }).eq('user_id', user!.id)
        }
        
        // Gamification: Add XP
        try {
          await addXP(user!.id, XP_PER_TASK)
          toast.success(`Task completed! +${XP_PER_TASK} XP 🔥`)
        } catch (err: any) {
          // Fallback if DB column doesn't exist yet
          console.warn("XP system requires database migration", err)
          toast.success('Task completed! 🎉')
        }
      }
      fetchActivities()
    }
  }

  const deleteActivity = async (id: string) => {
    const { error } = await supabase.from('activities').delete().eq('id', id)
    if (error) toast.error(error.message)
    else fetchActivities()
  }

  if (loading) return <div className="p-8">Loading Activities...</div>

  return (
    <Page>
      <PageHeader>
        <PageTitle>Daily Habits & Activities</PageTitle>
        <PageActions>
          <div className="flex gap-2">
            <Input 
              placeholder="Add new task..." 
              value={newActivity} 
              onChange={(e) => setNewActivity(e.target.value)}
              className="w-64"
            />
            <Button onClick={addActivity}><Plus className="w-4 h-4 mr-2" />Add</Button>
          </div>
        </PageActions>
      </PageHeader>
      <PageBody>
        <div className="grid grid-cols-1 gap-4">
          {activities.length > 0 ? (
            activities.map((act) => (
              <Card key={act.id} className={act.completed ? 'opacity-50' : ''}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleComplete(act.id, act.completed)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center ${act.completed ? 'bg-green-500 border-green-500 text-white' : 'border-border'}`}
                    >
                      {act.completed && <Check className="w-4 h-4" />}
                    </button>
                    <span className={act.completed ? 'line-through text-muted-foreground' : ''}>
                      {act.title}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteActivity(act.id)}>
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState 
              title="No activities yet" 
              description="Start by adding your first daily habit above."
            />
          )}
        </div>
      </PageBody>
    </Page>
  )
}
