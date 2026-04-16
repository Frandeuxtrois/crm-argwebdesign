'use client'

import { MessageCircle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WhatsAppMenuProps {
  whatsapp: string
  nombre: string
  marca: string
}

const PLANTILLAS = [
  {
    label: 'Bienvenida',
    emoji: '👋',
    mensaje: (nombre: string, marca: string) =>
      `Hola ${nombre}! Te damos la bienvenida como cliente de Argentina Webdesign. Estamos listos para comenzar a trabajar en ${marca}. Cualquier consulta, acá estamos.`,
  },
  {
    label: 'Cobro pendiente',
    emoji: '💰',
    mensaje: (nombre: string, marca: string) =>
      `Hola ${nombre}! Te recordamos que tenés un pago pendiente por el proyecto ${marca}. Cuando puedas, avisanos para coordinar. Gracias!`,
  },
  {
    label: 'Vencimiento próximo',
    emoji: '📅',
    mensaje: (nombre: string, marca: string) =>
      `Hola ${nombre}! Te avisamos que se acerca un vencimiento importante para ${marca}. Coordinemos con tiempo para renovarlo sin inconvenientes.`,
  },
  {
    label: 'Entrega lista',
    emoji: '🎉',
    mensaje: (nombre: string, marca: string) =>
      `Hola ${nombre}! Ya está lista la entrega del proyecto ${marca}. Quedamos a tu disposición para revisarlo juntos y hacer los ajustes finales.`,
  },
  {
    label: 'Solicitar feedback',
    emoji: '⭐',
    mensaje: (nombre: string, marca: string) =>
      `Hola ${nombre}! Queremos saber cómo te fue con ${marca}. Tu opinión es muy importante para nosotros. Cuando tengas un momento, nos contás?`,
  },
  {
    label: 'Contacto genérico',
    emoji: '💬',
    mensaje: (nombre: string, _marca: string) =>
      `Hola ${nombre}! Te escribo desde Argentina Webdesign.`,
  },
]

function buildWaUrl(whatsapp: string, mensaje: string) {
  const numero = whatsapp.replace(/\D/g, '')
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}

export function WhatsAppMenu({ whatsapp, nombre, marca }: WhatsAppMenuProps) {
  return (
    <details className="relative group">
      <summary
        title={`WhatsApp: ${whatsapp}`}
        className={cn(
          'inline-flex items-center gap-1 px-3 h-9 rounded-md border border-gray-200 bg-white text-sm font-medium cursor-pointer',
          'hover:bg-gray-50 transition-colors list-none select-none',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400',
        )}
      >
        <MessageCircle className="h-4 w-4 text-green-600" />
        <ChevronDown className="h-3 w-3 text-gray-400 transition-transform group-open:rotate-180" />
      </summary>

      <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-md border border-gray-200 bg-white shadow-lg py-1">
        <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Enviar mensaje
        </p>
        {PLANTILLAS.map((p) => (
          <a
            key={p.label}
            href={buildWaUrl(whatsapp, p.mensaje(nombre, marca))}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="text-base leading-none">{p.emoji}</span>
            {p.label}
          </a>
        ))}
      </div>
    </details>
  )
}
