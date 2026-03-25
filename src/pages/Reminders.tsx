import { useEffect, useState, useRef, useCallback } from 'react'
import { Page, PageHeader, PageTitle, PageActions, PageBody, Card, CardContent, Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, toast, EmptyState, Badge } from '@blinkdotnew/ui'
import { Plus, Bell, Trash2, Clock, BellRing } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const REMINDER_TYPES = [
  'Meditation',
  'Exercise',
  'Break Alert',
  'Hydration',
  'Uplifting Task'
]

const REMINDER_MESSAGES: Record<string, string> = {
  'Meditation': '🧘 Time to meditate! Take a few deep breaths and center yourself.',
  'Exercise': '💪 Time to move! A short walk or stretch can boost your energy.',
  'Break Alert': '☕ Take a break! Step away from the screen for a few minutes.',
  'Hydration': '💧 Drink some water! Stay hydrated for better focus.',
  'Uplifting Task': '🌟 Do something uplifting! Read, journal, or connect with a friend.'
}

export function RemindersPage() {
  const { user } = useAuth()
  const [reminders, setReminders] = useState<any[]>([])
  const [type, setType] = useState('Meditation')
  const [time, setTime] = useState('09:00')
  const [loading, setLoading] = useState(true)
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>('default')
  const firedReminders = useRef<Set<string>>(new Set())

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission)
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(perm => setNotifPermission(perm))
      }
    }
  }, [])

  useEffect(() => {
    if (user) fetchReminders()
  }, [user])

  // Check reminders every 30 seconds and fire notifications
  const checkReminders = useCallback(() => {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const todayKey = now.toDateString()

    reminders.forEach(rem => {
      // Compare HH:MM from reminder (rem.time could be "HH:MM" or "HH:MM:SS")
      const reminderHHMM = rem.time.substring(0, 5)
      const uniqueKey = `${rem.id}-${todayKey}-${reminderHHMM}`

      if (reminderHHMM === currentTime && !firedReminders.current.has(uniqueKey)) {
        firedReminders.current.add(uniqueKey)

        // Show in-app toast
        const msg = REMINDER_MESSAGES[rem.type] || `⏰ Reminder: ${rem.type}`
        toast.info(msg, { duration: 10000 })

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Neuro Guide — ${rem.type}`, {
            body: msg,
            icon: '/favicon.ico',
            tag: uniqueKey,
          })
        }
      }
    })
  }, [reminders])

  useEffect(() => {
    const interval = setInterval(checkReminders, 30000)
    checkReminders() // Run immediately on mount/update
    return () => clearInterval(interval)
  }, [checkReminders])

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

  const requestPermission = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission()
      setNotifPermission(perm)
    }
  }

  if (loading) return <div className="p-8">Loading Reminders...</div>

  return (
    <Page>
      <PageHeader>
        <PageTitle>Personal Reminders</PageTitle>
        <PageActions>
          <div className="flex gap-2 items-center">
            {notifPermission !== 'granted' && (
              <Button variant="outline" size="sm" onClick={requestPermission} className="text-amber-500 border-amber-500">
                <BellRing className="w-4 h-4 mr-1" />
                Enable Notifications
              </Button>
            )}
            <Select value={type} onValueChange={setType}>
              {/* @ts-ignore React 18.3 type conflict */}
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              {/* @ts-ignore React 18.3 type conflict */}
              <SelectContent>
                {REMINDER_TYPES.map(t => (
                  // @ts-ignore React 18.3 type conflict
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
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
        {notifPermission === 'granted' && (
          <div className="mb-4 flex items-center gap-2 text-sm text-green-500">
            <BellRing className="w-4 h-4" />
            Browser notifications are enabled — you'll be alerted when a reminder time arrives.
          </div>
        )}
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
