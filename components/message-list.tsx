import { Clock, Cpu, Gauge, Hash, Terminal } from 'lucide-react'
import type { ChatMessage } from '@/lib/types'

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-card text-primary">
        <Terminal className="size-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-balance">
        Empieza una conversación con el modelo
      </h2>
      <p className="mt-1 max-w-sm text-pretty text-sm text-muted-foreground">
        Cada respuesta se acompaña de sus métricas de uso: tokens de prompt, de completado, totales
        acumulados y velocidad de generación.
      </p>
    </div>
  )
}

function MetricChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1">
      <span className="text-primary" aria-hidden="true">
        {icon}
      </span>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </span>
  )
}

function AssistantMetrics({ message }: { message: ChatMessage }) {
  const m = message.metrics
  if (!m) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1.5 font-mono text-[11px]">
      <MetricChip
        icon={<Hash className="size-3" />}
        label="prompt"
        value={String(m.usage.prompt_tokens)}
      />
      <MetricChip
        icon={<Hash className="size-3" />}
        label="compl."
        value={String(m.usage.completion_tokens)}
      />
      <MetricChip
        icon={<Hash className="size-3" />}
        label="total"
        value={String(m.usage.total_tokens)}
      />
      {m.tokensPerSecond != null && (
        <MetricChip
          icon={<Gauge className="size-3" />}
          label="tok/s"
          value={m.tokensPerSecond.toFixed(1)}
        />
      )}
      <MetricChip
        icon={<Clock className="size-3" />}
        label="latencia"
        value={`${m.latencyMs} ms`}
      />
      <MetricChip icon={<Cpu className="size-3" />} label="" value={m.model} />
    </div>
  )
}

function LoadingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-lg rounded-tl-sm border border-border bg-card px-4 py-3">
        <span className="flex items-center gap-1" aria-label="Generando respuesta">
          <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
          <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
          <span className="size-2 animate-bounce rounded-full bg-muted-foreground" />
        </span>
      </div>
    </div>
  )
}

export function MessageList({
  messages,
  isLoading,
}: {
  messages: ChatMessage[]
  isLoading: boolean
}) {
  if (messages.length === 0 && !isLoading) return <EmptyState />

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      {messages.map((message) => {
        const isUser = message.role === 'user'
        return (
          <div key={message.id} className={isUser ? 'flex justify-end' : 'flex justify-start'}>
            <div className={isUser ? 'max-w-[85%]' : 'w-full max-w-[92%]'}>
              <div
                className={
                  isUser
                    ? 'rounded-lg rounded-tr-sm bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground'
                    : 'rounded-lg rounded-tl-sm border border-border bg-card px-4 py-2.5 text-sm leading-relaxed text-card-foreground'
                }
              >
                <p className="whitespace-pre-wrap text-pretty">{message.content}</p>
              </div>
              {!isUser && <AssistantMetrics message={message} />}
            </div>
          </div>
        )
      })}
      {isLoading && <LoadingBubble />}
    </div>
  )
}
