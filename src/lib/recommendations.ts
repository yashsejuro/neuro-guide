import { supabase } from '../lib/supabase'
import { Wind, Eye, Coffee, Timer, Puzzle, Smartphone, Sun, MessageCircle, ListChecks, Music, Monitor, Target, Clock, Brain, Droplets, Footprints, Lightbulb, Zap } from 'lucide-react'

export const CONDITIONS = ['ADHD', 'Anxiety', 'Depression', 'Focus Issues'] as const
export type Condition = typeof CONDITIONS[number]

export interface Suggestion {
  icon: any
  title: string
  why: string
  steps: string[]
  duration?: string
  color: string
}

export const STRUCTURED_RECOMMENDATIONS: Record<Condition, Suggestion[]> = {
  Anxiety: [
    {
      icon: Wind,
      title: 'Breathing Reset',
      why: 'Activates your parasympathetic nervous system to calm anxiety fast',
      steps: [
        'Inhale slowly for 4 seconds',
        'Hold your breath for 7 seconds',
        'Exhale gently for 8 seconds',
        'Repeat 3–4 cycles'
      ],
      duration: '2 min',
      color: 'text-sky-400'
    },
    {
      icon: Eye,
      title: 'Grounding Technique (5-4-3-2-1)',
      why: 'Anchors you in the present moment and reduces overthinking',
      steps: [
        'Name 5 things you can see',
        'Name 4 things you can touch',
        'Name 3 things you can hear',
        'Name 2 things you can smell',
        'Name 1 thing you can taste'
      ],
      duration: '3 min',
      color: 'text-emerald-400'
    },
    {
      icon: Coffee,
      title: 'Reduce Stimulation',
      why: 'Lowers cortisol and helps your nervous system settle',
      steps: [
        'Skip caffeine for the next 1–2 hours',
        'Close social media tabs',
        'Find a quiet space if possible',
        'Put your phone on silent'
      ],
      duration: '1–2 hrs',
      color: 'text-amber-400'
    },
    {
      icon: Droplets,
      title: 'Cold Water Reset',
      why: 'Triggers the dive reflex, slowing heart rate and reducing panic',
      steps: [
        'Splash cold water on your face',
        'Or hold ice cubes in your hands',
        'Take 5 slow breaths while doing so'
      ],
      duration: '1 min',
      color: 'text-cyan-400'
    }
  ],

  ADHD: [
    {
      icon: Timer,
      title: 'Pomodoro Focus Sprint',
      why: 'Gives your brain clear time boundaries so focus feels manageable',
      steps: [
        'Pick one task to work on',
        'Set a timer for 25 minutes',
        'Work without switching tasks',
        'Take a 5-minute break',
        'Repeat up to 4 cycles'
      ],
      duration: '25 min',
      color: 'text-rose-400'
    },
    {
      icon: Puzzle,
      title: 'Task Breakdown',
      why: 'Big tasks feel overwhelming — smaller pieces reduce resistance',
      steps: [
        'Write down the big task',
        'Break it into 3 small sub-tasks',
        'Start with the easiest one',
        'Celebrate each tiny win ✓'
      ],
      duration: '5 min',
      color: 'text-violet-400'
    },
    {
      icon: Smartphone,
      title: 'Distraction Control',
      why: 'Removes the biggest attention traps so you can stay on track',
      steps: [
        'Put your phone in another room',
        'Enable Focus Mode / DND',
        'Close all non-essential browser tabs',
        'Keep only 1 task visible on screen'
      ],
      duration: 'Ongoing',
      color: 'text-blue-400'
    },
    {
      icon: Music,
      title: 'Body Doubling / Background Focus',
      why: 'Having presence or ambient sound helps ADHD brains lock in',
      steps: [
        'Play lo-fi music or brown noise',
        'Or work alongside someone (virtual or in-person)',
        'Avoid music with lyrics'
      ],
      duration: 'While working',
      color: 'text-purple-400'
    }
  ],

  Depression: [
    {
      icon: Lightbulb,
      title: 'Micro Task Activation',
      why: 'Doing one small thing builds momentum when motivation is low',
      steps: [
        'Choose something tiny: drink water, stand up, or open a window',
        'Do just that one thing — nothing more',
        'Notice that you did it. That counts.',
        'If you feel like doing more, great. If not, that\'s okay too.'
      ],
      duration: '1 min',
      color: 'text-amber-400'
    },
    {
      icon: Sun,
      title: 'Sunlight Exposure',
      why: 'Natural light boosts serotonin and helps regulate your mood',
      steps: [
        'Step outside for 5–10 minutes',
        'Face the sunlight (don\'t look directly)',
        'Even overcast sky light helps',
        'Combine with a short walk if possible'
      ],
      duration: '5–10 min',
      color: 'text-yellow-400'
    },
    {
      icon: Footprints,
      title: 'Gentle Movement',
      why: 'Even light movement releases dopamine and endorphins naturally',
      steps: [
        'Stand up and stretch your arms',
        'Walk around your room or hallway',
        'Do 5 slow shoulder rolls',
        'No pressure — any movement is progress'
      ],
      duration: '2–5 min',
      color: 'text-emerald-400'
    },
    {
      icon: MessageCircle,
      title: 'Reach Out to Someone',
      why: 'A small connection can shift your perspective and reduce isolation',
      steps: [
        'Text one friend or family member',
        'It can be as simple as "Hey, how are you?"',
        'Or share how you\'re feeling honestly',
        'You don\'t need to have a long conversation'
      ],
      duration: '2 min',
      color: 'text-pink-400'
    }
  ],

  'Focus Issues': [
    {
      icon: Target,
      title: 'Deep Work Block',
      why: 'Focused work with no interruptions builds your concentration muscle',
      steps: [
        'Choose your single most important task',
        'Set a timer for 30–45 minutes',
        'Close all apps except the one you need',
        'Don\'t check messages until the timer ends'
      ],
      duration: '30–45 min',
      color: 'text-blue-400'
    },
    {
      icon: Monitor,
      title: 'Digital Detox Break',
      why: 'Screen overload fragments your attention — breaks restore it',
      steps: [
        'Step away from all screens for 15 minutes',
        'Look at something far away to rest your eyes',
        'Take a walk or do a simple physical task',
        'Return with fresh focus'
      ],
      duration: '15 min',
      color: 'text-teal-400'
    },
    {
      icon: ListChecks,
      title: 'Priority Rule (Pick 3)',
      why: 'Too many tasks causes decision fatigue — limit to regain clarity',
      steps: [
        'Write down everything on your plate',
        'Circle the top 3 most important tasks',
        'Ignore everything else until those are done',
        'Tackle them in order of difficulty'
      ],
      duration: '5 min',
      color: 'text-violet-400'
    },
    {
      icon: Zap,
      title: 'Energy Alignment',
      why: 'Matching tasks to your energy levels prevents burnout',
      steps: [
        'Do hard tasks when you have most energy (usually morning)',
        'Save easy tasks for low-energy times',
        'Take breaks between high-focus sessions',
        'Stay hydrated — dehydration kills focus'
      ],
      duration: 'All day',
      color: 'text-orange-400'
    }
  ]
}

// Keep old format for backwards compatibility
export const RECOMMENDATIONS: Record<Condition, string[]> = Object.fromEntries(
  Object.entries(STRUCTURED_RECOMMENDATIONS).map(([key, suggestions]) => [
    key,
    suggestions.map(s => `${s.title}: ${s.steps[0]}`)
  ])
) as Record<Condition, string[]>

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
