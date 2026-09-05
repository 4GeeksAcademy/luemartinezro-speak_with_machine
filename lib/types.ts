export type Role = 'user' | 'assistant'

export interface Usage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  /** Seconds Groq spent generating the completion. */
  completion_time?: number
  /** Seconds Groq spent processing the prompt. */
  prompt_time?: number
  /** Total server-side time reported by Groq, in seconds. */
  total_time?: number
}

export interface MessageMetrics {
  model: string
  usage: Usage
  /** Round-trip latency measured on our server, in milliseconds. */
  latencyMs: number
  /** Derived: completion_tokens / completion_time. */
  tokensPerSecond: number | null
}

export interface ChatMessage {
  id: string
  role: Role
  content: string
  createdAt: number
  /** Only present on assistant messages once a response is received. */
  metrics?: MessageMetrics
}

export interface ChatRequestBody {
  messages: { role: Role; content: string }[]
}

export interface ChatResponseBody {
  content: string
  metrics: MessageMetrics
}
