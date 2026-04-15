'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CopyFormLink({ workspaceId }: { workspaceId: string }) {
  const [copied, setCopied] = useState(false)
  const [url, setUrl] = useState(`/formulario/${workspaceId}`)

  useEffect(() => {
    setUrl(`${window.location.origin}/formulario/${workspaceId}`)
  }, [workspaceId])

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 text-xs bg-gray-50 border rounded px-3 py-2 text-gray-600 truncate">
        {url}
      </code>
      <Button variant="outline" size="icon" onClick={handleCopy} title="Copiar link">
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
      <a
        href={`/formulario/${workspaceId}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Abrir formulario"
        className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  )
}
