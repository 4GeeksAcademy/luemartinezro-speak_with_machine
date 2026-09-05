'use client'

import { useRef, useState } from 'react'
import { ArrowUp, Loader2 } from 'lucide-react'

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void
  disabled: boolean
}) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function submit() {
    if (disabled) return
    const text = value.trim()
    if (!text) return
    onSend(text)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Respect IME composition (CJK) — do not submit mid-composition.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function handleInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const el = e.currentTarget
    setValue(el.value)
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="flex items-end gap-2 rounded-xl border border-border bg-card p-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/20"
    >
      <textarea
        ref={textareaRef}
        value={value}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Escribe un mensaje… (Enter para enviar, Shift+Enter para salto de línea)"
        className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
        aria-label="Mensaje"
      />
      <button
        type="submit"
        disabled={disabled || value.trim().length === 0}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
        aria-label="Enviar mensaje"
      >
        {disabled ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <ArrowUp className="size-4" aria-hidden="true" />
        )}
      </button>
    </form>
  )
}
