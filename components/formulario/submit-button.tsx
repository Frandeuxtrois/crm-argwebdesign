'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-6 rounded-lg font-semibold text-sm text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
    >
      {pending ? 'Enviando...' : 'Enviar formulario'}
    </button>
  )
}
