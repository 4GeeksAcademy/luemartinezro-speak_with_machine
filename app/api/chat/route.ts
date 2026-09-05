import type { ChatRequestBody, ChatResponseBody } from '@/lib/types'

// Groq retired all Meta Llama 3.x generative models on 2026-08-16, so the brief's
// requested Llama 3 is no longer reachable. Qwen3.8-27b is a current free-tier open
// model that returns the same OpenAI-compatible `usage` metadata (tokens + timings).
const GROQ_MODEL = 'qwen/qwen3.8-27b'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const SYSTEM_PROMPT =
  'Eres un asistente útil y conciso integrado en una consola interna de pruebas. ' +
  'Responde de forma clara y directa.'

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'GROQ_API_KEY no está configurada en el servidor.' },
      { status: 500 },
    )
  }

  let body: ChatRequestBody
  try {
    body = (await request.json()) as ChatRequestBody
  } catch {
    return Response.json({ error: 'Cuerpo de la petición inválido.' }, { status: 400 })
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: 'Se requiere al menos un mensaje.' }, { status: 400 })
  }

  const startedAt = Date.now()

  let groqResponse: Response
  try {
    groqResponse = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...body.messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.7,
      }),
    })
  } catch {
    return Response.json({ error: 'No se pudo contactar con la API de Groq.' }, { status: 502 })
  }

  if (!groqResponse.ok) {
    const detail = await groqResponse.text()
    return Response.json(
      { error: `Groq devolvió un error (${groqResponse.status}).`, detail },
      { status: groqResponse.status },
    )
  }

  const data = await groqResponse.json()
  const latencyMs = Date.now() - startedAt

  // Qwen is a reasoning model: it wraps its chain-of-thought in <think>…</think>
  // before the final answer. Strip it so only the answer reaches the UI.
  const rawContent: string = data.choices?.[0]?.message?.content ?? ''
  const content = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim() || rawContent.trim()
  const usage = data.usage ?? {}

  const completionTime: number | undefined = usage.completion_time
  const completionTokens: number = usage.completion_tokens ?? 0
  const tokensPerSecond =
    completionTime && completionTime > 0
      ? Math.round((completionTokens / completionTime) * 10) / 10
      : null

  const payload: ChatResponseBody = {
    content,
    metrics: {
      model: data.model ?? GROQ_MODEL,
      usage: {
        prompt_tokens: usage.prompt_tokens ?? 0,
        completion_tokens: completionTokens,
        total_tokens: usage.total_tokens ?? 0,
        completion_time: usage.completion_time,
        prompt_time: usage.prompt_time,
        total_time: usage.total_time,
      },
      latencyMs,
      tokensPerSecond,
    },
  }

  return Response.json(payload)
}
