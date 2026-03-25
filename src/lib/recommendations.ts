import { supabase } from '../lib/supabase'

export const CONDITIONS = ['ADHD', 'Anxiety', 'Depression', 'Focus Issues'] as const
export type Condition = typeof CONDITIONS[number]

export const RECOMMENDATIONS: Record<Condition, string[]> = {
  ADHD: [
    'Use the Pomodoro technique: 25 mins focus, 5 mins break.',
    'Break large tasks into tiny sub-tasks.',
    'Clear your desk of all non-essential items.',
    'Use a timer for every activity.'
  ],
  Anxiety: [
    'Practice 4-7-8 breathing technique.',
    'Try a 5-minute guided meditation.',
    'Limit caffeine intake for the next few hours.',
    'Ground yourself: 5 things you can see, 4 you can touch.'
  ],
  Depression: [
    'Try to get 10 minutes of direct sunlight.',
    'Message one friend or family member.',
    'Complete one small physical task (e.g., make your bed).',
    'Listen to an uplifting playlist.'
  ],
  'Focus Issues': [
    'Turn off all non-essential notifications.',
    'Use a website blocker for social media.',
    'Put your phone in another room while working.',
    'Focus on one single task for at least 15 minutes.'
  ]
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: { condition?: Condition; display_name?: string }) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' })
    .select()
    .single()
  
  if (error) throw error
  return data
}
