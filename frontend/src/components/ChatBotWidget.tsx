'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChatbotService } from '@/services/chatbot.service'
import './ChatBot.css'

const MAX_PROMPT_LENGTH = 2000
const BOT_AVATAR = 'AI'
const USER_AVATAR = 'You'

interface Message {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
}

const suggestions = [
  'Best gaming PC',
  'Budget GPU picks',
  'Track my order',
  'Build help',
]

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const candidate = error as {
      message?: unknown
      error?: unknown
      data?: { message?: unknown }
    }

    if (typeof candidate.message === 'string' && candidate.message.trim()) {
      return candidate.message
    }

    if (typeof candidate.error === 'string' && candidate.error.trim()) {
      return candidate.error
    }

    if (typeof candidate.data?.message === 'string' && candidate.data.message.trim()) {
      return candidate.data.message
    }
  }

  return fallback
}

export default function ChatBotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState('')
  const [models, setModels] = useState<string[]>([])
  const [currentModel, setCurrentModel] = useState('')
  const [modelStatus, setModelStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const errorTimeoutRef = useRef<number | null>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const fetchModels = useCallback(async () => {
    setModelStatus('loading')

    try {
      const { models: modelNames, defaultModel } = await ChatbotService.getModels()

      setModels(modelNames)
      setCurrentModel((previousModel) => {
        if (previousModel && modelNames.includes(previousModel)) {
          return previousModel
        }

        return defaultModel
      })

      setModelStatus(defaultModel ? 'connected' : 'disconnected')
    } catch {
      setModelStatus('disconnected')
      setModels([])
      setCurrentModel('')
    }
  }, [])

  const showError = useCallback((message: string) => {
    setError(message)

    if (errorTimeoutRef.current !== null) {
      window.clearTimeout(errorTimeoutRef.current)
    }

    errorTimeoutRef.current = window.setTimeout(() => {
      setError('')
      errorTimeoutRef.current = null
    }, 5000)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    void fetchModels()
  }, [fetchModels])

  useEffect(() => {
    if (isOpen && modelStatus === 'disconnected') {
      void fetchModels()
    }
  }, [fetchModels, isOpen, modelStatus])

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current !== null) {
        window.clearTimeout(errorTimeoutRef.current)
      }
    }
  }, [])

  const handleOpen = () => {
    if (isOpen) {
      setIsClosing(true)
      window.setTimeout(() => {
        setIsOpen(false)
        setIsClosing(false)
      }, 280)
      return
    }

    setIsOpen(true)
    setError('')

    if (modelStatus === 'disconnected') {
      void fetchModels()
    }
  }

  const addMessage = useCallback((role: 'user' | 'bot', content: string): Message => {
    const message: Message = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      role,
      content,
      timestamp: new Date(),
    }

    setMessages((previousMessages) => [...previousMessages, message])

    return message
  }, [])

  const sendMessage = useCallback(async (text?: string) => {
    const message = (text || input).trim()

    if (!message || isTyping) {
      return
    }

    if (message.length > MAX_PROMPT_LENGTH) {
      showError(`Messages can be up to ${MAX_PROMPT_LENGTH} characters.`)
      return
    }

    addMessage('user', message)
    setInput('')
    setIsTyping(true)
    setError('')

    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    try {
      const result = await ChatbotService.sendMessage({
        model: currentModel || undefined,
        prompt: message,
      })

      addMessage('bot', result.response)
      setModelStatus('connected')

      if (result.model) {
        setCurrentModel(result.model)
        setModels((previousModels) =>
          previousModels.includes(result.model)
            ? previousModels
            : [result.model, ...previousModels]
        )
      }
    } catch (error) {
      showError(getErrorMessage(error, 'Failed to get response. Please try again.'))

      if (models.length === 0) {
        setModelStatus('disconnected')
      }
    } finally {
      setIsTyping(false)
    }
  }, [addMessage, currentModel, input, isTyping, models.length, showError])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void sendMessage()
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const element = event.target
    const nextValue = element.value.slice(0, MAX_PROMPT_LENGTH)

    setInput(nextValue)

    if (element.value !== nextValue) {
      element.value = nextValue
    }

    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, 100)}px`
  }

  const clearChat = () => {
    setMessages([])
    setError('')
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {isOpen && (
        <div className={`oggy-chat-window${isClosing ? ' closing' : ''}`}>
          <div className="oggy-header">
            <div className="oggy-header-orb oggy-header-orb-1" />
            <div className="oggy-header-orb oggy-header-orb-2" />

            <div className="oggy-avatar">{BOT_AVATAR}</div>

            <div className="oggy-header-info">
              <p className="oggy-header-name">Oggy AI</p>
              <div className="oggy-header-status">
                <span className="oggy-status-dot" />
                {modelStatus === 'connected'
                  ? 'Online - Ready to help'
                  : modelStatus === 'loading'
                  ? 'Connecting...'
                  : 'Offline'}
              </div>
            </div>

            <div className="oggy-header-actions">
              <button className="oggy-header-btn" onClick={clearChat} title="Clear chat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
              <button className="oggy-header-btn" onClick={handleOpen} title="Close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="oggy-model-bar">
            <span className="oggy-model-label">Model</span>
            <select
              className="oggy-model-select"
              value={currentModel}
              disabled={modelStatus === 'loading' || models.length === 0}
              onChange={(event) => {
                setCurrentModel(event.target.value)
                setModelStatus(event.target.value ? 'connected' : 'disconnected')
              }}
            >
              {models.length === 0 && (
                <option value="">
                  {modelStatus === 'loading' ? 'Loading models...' : 'Auto-select on send'}
                </option>
              )}
              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
            <span className={`oggy-model-status ${modelStatus}`} />
          </div>

          {error && (
            <div className="oggy-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              {error}
            </div>
          )}

          <div className="oggy-messages">
            {messages.length === 0 && !isTyping ? (
              <div className="oggy-welcome">
                <div className="oggy-welcome-icon">{BOT_AVATAR}</div>
                <h3 className="oggy-welcome-title">Hey! I&apos;m Oggy</h3>
                <p className="oggy-welcome-desc">
                  Your AI assistant for PC builds, product recommendations, and tech support. How can I help?
                </p>
                <div className="oggy-suggestions">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      className="oggy-suggestion"
                      onClick={() => void sendMessage(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id} className={`oggy-msg ${message.role === 'user' ? 'user' : 'bot'}`}>
                    <div className="oggy-msg-avatar">
                      {message.role === 'bot' ? BOT_AVATAR : USER_AVATAR}
                    </div>
                    <div className="oggy-msg-content">
                      <div className="oggy-msg-bubble">{message.content}</div>
                      <span className="oggy-msg-time">{formatTime(message.timestamp)}</span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="oggy-typing">
                    <div className="oggy-typing-avatar">{BOT_AVATAR}</div>
                    <div className="oggy-typing-bubble">
                      <span className="oggy-typing-dot" />
                      <span className="oggy-typing-dot" />
                      <span className="oggy-typing-dot" />
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="oggy-input-area">
            <div className="oggy-input-row">
              <div className="oggy-input-wrap">
                <textarea
                  ref={inputRef}
                  className="oggy-input"
                  value={input}
                  maxLength={MAX_PROMPT_LENGTH}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Oggy anything..."
                  rows={1}
                />
              </div>
              <button
                className="oggy-send-btn"
                onClick={() => void sendMessage()}
                disabled={!input.trim() || isTyping}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <div className="oggy-input-footer">
              <span className="oggy-powered">
                <span className="oggy-powered-dot" />
                Powered by Sofflex AI
              </span>
              {input.length > 0 && (
                <span className="oggy-char-count">{input.length}/{MAX_PROMPT_LENGTH}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        className={`oggy-fab${isOpen ? ' open' : ''}`}
        onClick={handleOpen}
        aria-label={isOpen ? 'Close chat' : 'Open Oggy AI chat'}
        id="oggy-chat-fab"
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              <path d="M8 10h.01M12 10h.01M16 10h.01" />
            </svg>
            <span className="oggy-fab-badge" />
          </>
        )}
      </button>
    </>
  )
}
