'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RotateCcw, TriangleAlert } from 'lucide-react'
import type { ChatMessage, ChatResponseBody } from '@/lib/types'
import { ChatHeader } from './chat-header'
import { MessageList } from './message-list'
import { ChatInput } from './chat-input'
import { MetricsPanel } from './metrics-panel'

const STORAGE_KEY = 'groq-console:session:v1'

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function ChatConsole() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load persisted session after mount to avoid hydration mismatches.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setMessages(JSON.parse(raw) as ChatMessage[])
    } catch {
      // Corrupt storage — start fresh rather than crash the console.
    }
    setHydrated(true)
  }, [])

  // Persist every change so a reload or accidental tab close keeps the session.
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // Storage full or unavailable — non-fatal for a prototype.
    }
  }, [messages, hydrated])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isLoading])

  const sessionTotals = useMemo(() => {
    return messages.reduce(
      (acc, m) => {
        if (m.metrics) {
          acc.prompt += m.metrics.usage.prompt_tokens
          acc.completion += m.metrics.usage.completion_tokens
          acc.total += m.metrics.usage.total_tokens
          acc.responses += 1
          acc.latencyMs += m.metrics.latencyMs
          if (m.metrics.tokensPerSecond) acc.tpsSum += m.metrics.tokensPerSecond
        }
        return acc
      },
      { prompt: 0, completion: 0, total: 0, responses: 0, latencyMs: 0, tpsSum: 0 },
    )
  }, [messages])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isLoading) return
      setError(null)

      const userMessage: ChatMessage = {
        id: createId(),
        role: 'user',
        content: trimmed,
        createdAt: Date.now(),
      }
      const next = [...messages, userMessage]
      setMessages(next)
      setIsLoading(true)

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: next.map((m) => ({ role: m.role, content: m.content })),
          }),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error ?? `Error ${res.status}`)
        }

        const data = (await res.json()) as ChatResponseBody
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: 'assistant',
            content: data.content,
            createdAt: Date.now(),
            metrics: data.metrics,
          },
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.')
      } finally {
        setIsLoading(false)
      }
    },
    [messages, isLoading],
  )

  const reset = useCallback(() => {
    setMessages([])
    setError(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [])

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <ChatHeader
        model={messages.find((m) => m.metrics)?.metrics?.model}
        messageCount={messages.length}
      />

      <div className="flex min-h-0 flex-1 flex-col-reverse lg:flex-row">
        {/* Conversation column */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
            <MessageList messages={messages} isLoading={isLoading} />
          </div>

          {error && (
            <div
              role="alert"
              className="mx-auto flex w-full max-w-3xl items-start gap-2 px-4 pb-2 text-sm text-destructive"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div className="border-t border-border bg-background/80 backdrop-blur">
            <div className="mx-auto w-full max-w-3xl px-4 py-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-mono text-xs text-muted-foreground">
                  {messages.length === 0
                    ? 'Sesión nueva'
                    : `${messages.length} mensaje${messages.length === 1 ? '' : 's'} en sesión`}
                </p>
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                    Reiniciar sesión
                  </button>
                )}
              </div>
              <ChatInput onSend={send} disabled={isLoading} />
            </div>
          </div>
        </div>

        {/* Metrics column */}
        <MetricsPanel totals={sessionTotals} messages={messages} />
      </div>
    </div>
  )
}
