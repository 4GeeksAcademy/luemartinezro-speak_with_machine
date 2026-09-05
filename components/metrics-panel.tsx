import { Activity, Clock, Gauge, Layers } from 'lucide-react'
import type { ChatMessage } from '@/lib/types'

interface Totals {
  prompt: number
  completion: number
  total: number
  responses: number
  latencyMs: number
  tpsSum: number
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border/60 py-2 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-medium tabular-nums">{value}</span>
    </div>
  )
}

export function MetricsPanel({
  totals,
  messages,
}: {
  totals: Totals
  messages: ChatMessage[]
}) {
  const promptPct = totals.total > 0 ? (totals.prompt / totals.total) * 100 : 0
  const completionPct = totals.total > 0 ? (totals.completion / totals.total) * 100 : 0
  const avgLatency = totals.responses > 0 ? Math.round(totals.latencyMs / totals.responses) : 0
  const avgTps = totals.responses > 0 ? totals.tpsSum / totals.responses : 0

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant' && m.metrics)
  const last = lastAssistant?.metrics

  return (
    <aside className="flex max-h-[42vh] shrink-0 flex-col gap-5 overflow-y-auto border-b border-border bg-sidebar p-5 lg:max-h-none lg:w-80 lg:border-b-0 lg:border-l">
      <div>
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-semibold">Uso de la sesión</h2>
        </div>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          Acumulado sobre {totals.responses} respuesta{totals.responses === 1 ? '' : 's'}
        </p>
      </div>

      {/* Accumulated total tokens headline */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="font-mono text-xs text-muted-foreground">Tokens totales acumulados</p>
        <p className="mt-1 font-mono text-3xl font-semibold tabular-nums">
          {totals.total.toLocaleString('es')}
        </p>

        {/* Prompt vs completion split */}
        <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary"
            style={{ width: `${promptPct}%` }}
            aria-hidden="true"
          />
          <div
            className="h-full bg-chart-3"
            style={{ width: `${completionPct}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-primary" aria-hidden="true" />
            prompt {totals.prompt.toLocaleString('es')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-chart-3" aria-hidden="true" />
            completado {totals.completion.toLocaleString('es')}
          </span>
        </div>
      </div>

      {/* Aggregate stats */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-1 flex items-center gap-2">
          <Layers className="size-3.5 text-primary" aria-hidden="true" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Promedios
          </h3>
        </div>
        <StatRow label="Respuestas" value={String(totals.responses)} />
        <StatRow label="Latencia media" value={`${avgLatency} ms`} />
        <StatRow label="Velocidad media" value={`${avgTps.toFixed(1)} tok/s`} />
      </div>

      {/* Last response detail */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-1 flex items-center gap-2">
          <Gauge className="size-3.5 text-primary" aria-hidden="true" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Última respuesta
          </h3>
        </div>
        {last ? (
          <>
            <StatRow label="Modelo" value={last.model} />
            <StatRow label="Prompt" value={`${last.usage.prompt_tokens} tok`} />
            <StatRow label="Completado" value={`${last.usage.completion_tokens} tok`} />
            <StatRow label="Total" value={`${last.usage.total_tokens} tok`} />
            {last.tokensPerSecond != null && (
              <StatRow label="Velocidad" value={`${last.tokensPerSecond.toFixed(1)} tok/s`} />
            )}
            <StatRow label="Latencia" value={`${last.latencyMs} ms`} />
          </>
        ) : (
          <p className="flex items-center gap-1.5 py-2 text-xs text-muted-foreground">
            <Clock className="size-3.5" aria-hidden="true" />
            Aún no hay respuestas en esta sesión.
          </p>
        )}
      </div>
    </aside>
  )
}
