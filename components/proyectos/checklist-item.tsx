'use client'

import { useTransition } from 'react'
import { toggleChecklistItem, eliminarChecklistItem } from '@/app/(admin)/proyectos/actions'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

interface Props {
  item: {
    id: string
    titulo: string
    completado: boolean
  }
  proyectoId: string
}

export function ChecklistItem({ item, proyectoId }: Props) {
  const [pending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(() => {
      toggleChecklistItem(item.id, proyectoId, item.completado)
    })
  }

  function handleEliminar() {
    startTransition(() => {
      eliminarChecklistItem(item.id, proyectoId)
    })
  }

  return (
    <div className={cn(
      'flex items-center gap-3 py-2 px-3 rounded-md group transition-opacity',
      pending && 'opacity-50'
    )}>
      <button
        onClick={handleToggle}
        disabled={pending}
        className={cn(
          'h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors',
          item.completado
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-gray-400'
        )}
      >
        {item.completado && (
          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <span className={cn(
        'flex-1 text-sm',
        item.completado ? 'line-through text-gray-400' : 'text-gray-700'
      )}>
        {item.titulo}
      </span>

      <button
        onClick={handleEliminar}
        disabled={pending}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
