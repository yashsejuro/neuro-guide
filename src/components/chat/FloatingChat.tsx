import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { sendToGroq, ChatMessage } from '../../lib/chat-engine'
import { getProfile } from '../../lib/recommendations'
import { useAuth } from '../../hooks/useAuth'

const QUICK_PROMPTS = [
  { label: '😰 I feel anxious', text: 'I feel really anxious right now. Can you help me calm down?' },
  { label: '🧠 I can\'t focus', text: 'I can\'t focus on anything today. What should I do?' },
  { label: '😔 I feel low', text: 'I\'m feeling really low and unmotivated today.' },
  { label: '💜 Just need to talk', text: 'Hi, I just need someone to talk to for a moment.' },
]

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: "Hey there! 👋 I'm **Neuro**, your wellness companion. I'm here to help you manage stress, focus better, and feel more in control.\n\nTell me how you're feeling, or tap a quick option below to get started!",
  timestamp: new Date()
}

// Expandable message component
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  const [expanded, setExpanded] = useState(true)
  const isLong = message.content.length > 300
  const displayContent = !expanded && isLong 
    ? message.content.substring(0, 250) + '...' 
    : message.content

  // Format markdown-like bold text
  const formatContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
      }
      // Handle newlines
      return part.split('\n').map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ))
    })
  }

  return (
    <div className={`ng-chat-msg ${isUser ? 'ng-chat-msg-user' : 'ng-chat-msg-ai'}`}>
      {!isUser && (
        <div className="ng-chat-avatar">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      )}
      <div className={`ng-chat-bubble ${isUser ? 'ng-chat-bubble-user' : 'ng-chat-bubble-ai'}`}>
        <div className={isLong && !expanded ? 'ng-chat-truncated' : ''}>
          {formatContent(displayContent)}
        </div>
        {isLong && (
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="ng-chat-expand-btn"
          >
            {expanded ? (
              <><ChevronUp className="w-3 h-3" /> Show less</>
            ) : (
              <><ChevronDown className="w-3 h-3" /> Show more</>
            )}
          </button>
        )}
        <div className="ng-chat-time">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

// Typing dots animation
function TypingIndicator() {
  return (
    <div className="ng-chat-msg ng-chat-msg-ai">
      <div className="ng-chat-avatar">
        <Sparkles className="w-3.5 h-3.5" />
      </div>
      <div className="ng-chat-bubble ng-chat-bubble-ai ng-chat-typing">
        <span className="ng-dot" />
        <span className="ng-dot" />
        <span className="ng-dot" />
      </div>
    </div>
  )
}

export function FloatingChat() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [userCondition, setUserCondition] = useState<string | undefined>()
  const [hasUnread, setHasUnread] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load user condition
  useEffect(() => {
    if (user) {
      getProfile(user.id).then(p => {
        if (p?.condition) setUserCondition(p.condition)
      }).catch(() => {})
    }
  }, [user])

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = '0'
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
    }
  }, [input])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return

    const userMsg: ChatMessage = { role: 'user', content: text.trim(), timestamp: new Date() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsTyping(true)

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = '44px'

    try {
      const response = await sendToGroq(newMessages, userCondition)
      const aiMsg: ChatMessage = { role: 'assistant', content: response, timestamp: new Date() }
      setMessages(prev => [...prev, aiMsg])
      if (!isOpen) setHasUnread(true)
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Something went wrong. Please try again. 💜",
        timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const toggleOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen) setHasUnread(false)
  }

  // Don't show on public pages
  if (!user) return null

  return (
    <>
      {/* Chat Window */}
      <div className={`ng-chat-window ${isOpen ? 'ng-chat-open' : 'ng-chat-closed'}`}>
        {/* Header */}
        <div className="ng-chat-header">
          <div className="flex items-center gap-2.5">
            <div className="ng-chat-header-icon">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Neuro AI</h3>
              <p className="text-[10px] text-white/60">Your wellness companion</p>
            </div>
          </div>
          <button onClick={toggleOpen} className="ng-chat-close-btn">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="ng-chat-body">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts (show only if few messages) */}
        {messages.length <= 2 && !isTyping && (
          <div className="ng-chat-prompts">
            {QUICK_PROMPTS.map((p, i) => (
              <button 
                key={i} 
                onClick={() => sendMessage(p.text)}
                className="ng-chat-prompt-btn"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="ng-chat-input-wrap">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type how you're feeling..."
            rows={1}
            className="ng-chat-input"
            disabled={isTyping}
          />
          <button 
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="ng-chat-send-btn"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Bubble */}
      <button onClick={toggleOpen} className={`ng-chat-fab ${isOpen ? 'ng-chat-fab-active' : ''}`}>
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {hasUnread && <span className="ng-chat-unread" />}
          </>
        )}
      </button>
    </>
  )
}
