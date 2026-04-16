'use client'

import { useState, useEffect } from 'react'

export function Clock() {
  const [ahora, setAhora] = useState<Date | null>(null)

  useEffect(() => {
    setAhora(new Date())
    const timer = setInterval(() => setAhora(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!ahora) return <div className="text-right w-40" />

  const diaSemana = ahora.toLocaleDateString('es-AR', { weekday: 'long' })
    .replace(/^\w/, c => c.toUpperCase())
  const fecha = ahora.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
  const hora = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <div className="text-right">
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{hora}</p>
      <p className="text-base font-semibold text-gray-700 mt-0.5">{diaSemana}</p>
      <p className="text-sm text-gray-400 mt-0.5">{fecha}</p>
    </div>
  )
}
