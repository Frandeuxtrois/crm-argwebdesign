'use client'

import { useRef, useState, useTransition } from 'react'
import { subirDocumento, eliminarDocumento, descargarDocumento } from '@/app/(admin)/documentos/actions'
import { FileText, Download, Trash2, Upload, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Documento = {
  id: string
  nombre: string
  ruta: string
  tipo: string | null
  created_at: string
  [key: string]: unknown
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentosPanel({
  proyectoId,
  clienteId,
  documentos,
}: {
  proyectoId: string
  clienteId: string | null
  documentos: Documento[]
}) {
  const [isPending, startTransition] = useTransition()
  const [fileName, setFileName] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const subirConIds = subirDocumento.bind(null, proyectoId, clienteId)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileName(e.target.files?.[0]?.name ?? null)
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await subirConIds(formData)
      setFileName(null)
      formRef.current?.reset()
    })
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <Paperclip className="h-4 w-4 text-gray-400" />
        <p className="text-sm font-semibold text-gray-700">Documentos</p>
        <span className="text-xs text-gray-400 ml-1">({documentos.length})</span>
      </div>

      {/* Lista de documentos */}
      {documentos.length === 0 ? (
        <p className="px-4 py-5 text-sm text-gray-400 text-center">Sin documentos adjuntos</p>
      ) : (
        <div className="divide-y">
          {documentos.map((doc) => {
            const eliminarConDatos = eliminarDocumento.bind(null, doc.id, doc.ruta, proyectoId)
            const descargarConRuta = descargarDocumento.bind(null, doc.ruta)

            return (
              <div key={doc.id} className="flex items-center gap-3 px-4 py-3">
                <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.nombre}</p>
                  <p className="text-xs text-gray-400">
                    {doc['tamaño'] ? formatBytes(doc['tamaño'] as number) : ''} · {new Date(doc.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <form action={descargarConRuta}>
                    <Button type="submit" variant="ghost" size="icon" className="h-7 w-7" title="Descargar">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                  <form action={eliminarConDatos}>
                    <Button type="submit" variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50" title="Eliminar">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Upload */}
      <div className="border-t p-3">
        <form ref={formRef} action={handleSubmit} className="flex items-center gap-2">
          <label className={cn(
            'flex items-center gap-2 flex-1 min-w-0 px-3 py-1.5 rounded-md border border-dashed text-xs cursor-pointer transition-colors',
            fileName ? 'border-gray-400 text-gray-700 bg-gray-50' : 'border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500'
          )}>
            <Upload className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{fileName ?? 'Elegir archivo...'}</span>
            <input
              type="file"
              name="archivo"
              className="sr-only"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
            />
          </label>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="h-8 text-xs shrink-0"
            disabled={!fileName || isPending}
          >
            {isPending ? 'Subiendo...' : 'Subir'}
          </Button>
        </form>
      </div>
    </div>
  )
}
