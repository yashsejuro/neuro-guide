import { STRUCTURED_RECOMMENDATIONS, type Condition } from './recommendations'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

function getGroqKey(): string {
  return import.meta.env.VITE_GROQ_API_KEY || ''
}

// Build a system prompt with all our recommendation knowledge
function buildSystemPrompt(userCondition?: string): string {
  let conditionContext = ''
  
  if (userCondition && STRUCTURED_RECOMMENDATIONS[userCondition as Condition]) {
    const suggestions = STRUCTURED_RECOMMENDATIONS[userCondition as Condition]
    conditionContext = `\n\nThe user's selected condition is: ${userCondition}. Here are the specific techniques you should recommend:\n`
    suggestions.forEach((s, i) => {
      conditionContext += `\n${i + 1}. **${s.title}** (${s.duration || 'anytime'})\n   Why: ${s.why}\n   Steps: ${s.steps.join(' → ')}\n`
    })
  } else {
    // Include all conditions
    conditionContext = '\n\nHere are techniques you can recommend based on what the user shares:\n'
    for (const [condition, suggestions] of Object.entries(STRUCTURED_RECOMMENDATIONS)) {
      conditionContext += `\n**${condition}:**\n`
      suggestions.forEach((s, i) => {
        conditionContext += `${i + 1}. ${s.title} (${s.duration || 'anytime'}): ${s.why}. Steps: ${s.steps.join(' → ')}\n`
      })
    }
  }

  return `You are "Neuro", a warm and supportive AI wellness companion inside the Neuro Guide mental wellness app. 

Your personality:
- Empathetic, calm, and encouraging — never clinical or cold
- Use simple, clear language — no jargon
- Keep responses short (2-4 sentences max for casual chat, up to 6 for technique explanations)
- Use emoji sparingly but warmly (💜 🌿 🧠 ✨ 💪)
- Never diagnose — you provide coping techniques and emotional support
- If someone is in crisis, gently suggest professional help

Your capabilities:
- Recommend specific coping techniques for anxiety, ADHD, depression, and focus issues
- Provide step-by-step guidance for breathing, grounding, and mindfulness exercises
- Offer encouragement and supportive messages
- Help users understand their feelings

When recommending a technique, format it clearly:
**Technique Name** (duration)
Why it helps: [1 line]
Steps:
1. [step]
2. [step]
3. [step]

${conditionContext}

Important rules:
- NEVER start with "I'm sorry to hear that" — vary your empathetic openers
- Keep it conversational, like a caring friend
- If the user says something positive, celebrate with them
- Always end with something actionable or encouraging`
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export async function sendToGroq(
  messages: ChatMessage[], 
  userCondition?: string
): Promise<string> {
  const apiKey = getGroqKey()
  
  if (!apiKey) {
    return "I'm not connected yet — please add your Groq API key to the environment settings. I'll be ready to chat once that's done! 🔧"
  }

  const systemPrompt = buildSystemPrompt(userCondition)

  const apiMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...messages.slice(-10).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))
  ]

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 512,
        top_p: 0.9
      })
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Groq API error:', err)
      if (res.status === 401) return "API key seems invalid. Please check your Groq API key. 🔑"
      if (res.status === 429) return "I need a moment — too many requests. Try again in a few seconds. ⏳"
      return "Something went wrong on my end. Please try again in a moment. 💜"
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content || "I'm here, but I couldn't form a response. Try rephrasing? 💭"
  } catch (error) {
    console.error('Groq fetch error:', error)
    return "I couldn't reach my brain right now — check your internet connection and try again. 🌐"
  }
}
