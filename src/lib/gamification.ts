import { supabase } from './supabase'

// XP and leveling constants
export const XP_PER_TASK = 10
export const XP_PER_LEVEL = 100

export interface GamificationData {
  xp: number
  level: number
  badges: string[]
}

// Badge definitions
export interface Badge {
  id: string
  label: string
  emoji: string
  description: string
  check: (xp: number, streak: number, tasksCompleted: number) => boolean
}

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_task',
    label: 'First Step',
    emoji: '🌱',
    description: 'Completed your first task',
    check: (_, __, tasks) => tasks >= 1
  },
  {
    id: 'five_tasks',
    label: 'Getting Going',
    emoji: '⚡',
    description: 'Completed 5 tasks',
    check: (_, __, tasks) => tasks >= 5
  },
  {
    id: 'ten_tasks',
    label: 'Task Master',
    emoji: '🏅',
    description: 'Completed 10 tasks',
    check: (_, __, tasks) => tasks >= 10
  },
  {
    id: 'streak_3',
    label: '3-Day Streak',
    emoji: '🔥',
    description: 'Maintained a 3-day streak',
    check: (_, streak) => streak >= 3
  },
  {
    id: 'streak_7',
    label: 'Week Warrior',
    emoji: '💎',
    description: 'Maintained a 7-day streak',
    check: (_, streak) => streak >= 7
  },
  {
    id: 'streak_14',
    label: 'Consistency King',
    emoji: '👑',
    description: 'Maintained a 14-day streak',
    check: (_, streak) => streak >= 14
  },
  {
    id: 'level_2',
    label: 'Level Up',
    emoji: '⬆️',
    description: 'Reached Level 2',
    check: (xp) => xp >= 200
  },
  {
    id: 'level_5',
    label: 'Dedicated',
    emoji: '🌟',
    description: 'Reached Level 5',
    check: (xp) => xp >= 500
  }
]

export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function xpToNextLevel(xp: number): number {
  return XP_PER_LEVEL - (xp % XP_PER_LEVEL)
}

export function xpProgress(xp: number): number {
  return (xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100
}

export function getEarnedBadges(xp: number, streak: number, tasksCompleted: number): Badge[] {
  return ALL_BADGES.filter(b => b.check(xp, streak, tasksCompleted))
}

// Fetch XP from profiles table
export async function getXP(userId: string): Promise<number> {
  const { data } = await supabase
    .from('profiles')
    .select('xp')
    .eq('user_id', userId)
    .maybeSingle()
  return data?.xp || 0
}

// Add XP and return new total
export async function addXP(userId: string, amount: number): Promise<number> {
  const current = await getXP(userId)
  const newXP = current + amount
  await supabase
    .from('profiles')
    .upsert({ user_id: userId, xp: newXP }, { onConflict: 'user_id' })
  return newXP
}

// Get total completed tasks count
export async function getCompletedTasksCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('activities')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('completed', true)
  return count || 0
}
