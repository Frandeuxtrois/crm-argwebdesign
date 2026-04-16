'use client'

import { useState } from 'react'

const inputClass = "w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500"

export function FileInput() {
  const [archivos, setArchivos] = useState<File[]>([])

  return (
    <div className="space-y-2">
      <label
        htmlFor="fotos_archivos"
        className="flex flex-col items-center justify-center gap-2 w-full rounded-md border-2 border-dashed border-zinc-700 hover:border-zinc-500 px-4 py-6 cursor-pointer transition-colors group"
      >
        <svg className="w-8 h-8 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors text-center">
          {archivos.length === 0
            ? <>Hacé click para elegir archivos<br /><span className="text-xs text-zinc-600">JPG, PNG, PDF, DOC — múltiples</span></>
            : <span className="text-zinc-200 font-medium">{archivos.length} archivo{archivos.length > 1 ? 's' : ''} seleccionado{archivos.length > 1 ? 's' : ''}</span>
          }
        </span>
        <input
          id="fotos_archivos"
          name="fotos_archivos"
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          className="sr-only"
          onChange={(e) => setArchivos(Array.from(e.target.files ?? []))}
        />
      </label>

      {archivos.length > 0 && (
        <ul className="space-y-1">
          {archivos.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-800 rounded px-3 py-1.5">
              <svg className="w-3.5 h-3.5 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="truncate">{f.name}</span>
              <span className="ml-auto shrink-0 text-zinc-600">{(f.size / 1024).toFixed(0)} KB</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
