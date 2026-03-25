import React, { useEffect, useState } from 'react'
import { Page, PageHeader, PageTitle, PageActions, PageBody, Card, CardContent, Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, toast, EmptyState } from '@blinkdotnew/ui'
import { Plus, Bell, Trash2, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const REMINDER_TYPES = [
  'Meditation',
  'Exercise',
  'Break Alert',
  'Hydration',
  'Uplifting Task'
]

export function RemindersPage() {
  const { user } = useAuth()
  const [reminders, setReminders] = useState<any[]>([])
  const [type, setType] = useState('Meditation')
  const [time, setTime] = useState('09:00')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchReminders()
  }, [user])

  const fetchReminders = async () => {
    if (!user) return
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('time', { ascending: true })
    setReminders(data || [])
    setLoading(false)
  }

  const addReminder = async () => {
    if (!user) return
    const { error } = await supabase.from('reminders').insert({
      user_id: user.id,
      type,
      time
    })
    if (error) toast.error(error.message)
    else {
      fetchReminders()
      toast.success('Reminder added')
    }
  }

  const deleteReminder = async (id: string) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id)
    if (error) toast.error(error.message)
    else fetchReminders()
  }

  if (loading) return <div className="p-8">Loading Reminders...</div>

  return (
    <Page>
      <PageHeader>
        <PageTitle>Personal Reminders</PageTitle>
        <PageActions>
          <div className="flex gap-2">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)}
              className="w-32"
            />
            <Button onClick={addReminder}><Plus className="w-4 h-4 mr-2" />Add</Button>
          </div>
        </PageActions>
      </PageHeader>
      <PageBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.length > 0 ? (
            reminders.map((rem) => (
              <Card key={rem.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-full">
                      <Bell className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">{rem.type}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {rem.time}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteReminder(rem.id)}>
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState 
              title="No reminders set" 
              description="Schedule breaks or healthy activities to stay on track."
            />
          )}
        </div>
      </PageBody>
    </Page>
  )
}
