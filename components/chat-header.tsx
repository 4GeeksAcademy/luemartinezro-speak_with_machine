import { Cpu, Zap } from 'lucide-react'

export function ChatHeader({
  model,
  messageCount,
}: {
  model?: string
  messageCount: number
}) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Zap className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-tight">Groq Chat Console</h1>
          <p className="font-mono text-xs text-muted-foreground">
            Inferencia en tiempo real · métricas de uso
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="hidden items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-secondary-foreground sm:inline-flex">
          <Cpu className="size-3.5 text-primary" aria-hidden="true" />
          {model ?? 'qwen/qwen3.8-27b'}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-muted-foreground">
          <span
            className="size-1.5 rounded-full bg-primary"
            aria-hidden="true"
          />
          {messageCount > 0 ? 'activa' : 'lista'}
        </span>
      </div>
    </header>
  )
}
