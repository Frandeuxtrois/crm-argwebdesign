'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const glassInput = 'w-full h-9 rounded-lg bg-zinc-900 border border-zinc-800 px-3 text-sm text-white placeholder:text-zinc-600 outline-none'

export function PasswordInput() {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative h-9">
      <input
        id="password"
        name="password"
        type={visible ? 'text' : 'password'}
        required
        autoComplete="current-password"
        className={glassInput + ' h-full pr-9'}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
        tabIndex={-1}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}
