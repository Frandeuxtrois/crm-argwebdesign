import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { procesarOnboarding } from '../actions'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

function Campo({ label, valor }: { label: string; valor: unknown }) {
  if (!valor || (Array.isArray(valor) && valor.length === 0)) return null

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-gray-900">
        {Array.isArray(valor) ? valor.join(', ') : String(valor)}
      </p>
    </div>
  )
}

export default async function OnboardingDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { data: entrada } = await supabase
    .from('onboarding')
    .select('*')
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .single()

  if (!entrada) notFound()

  const r = entrada.respuestas as Record<string, unknown>
  const procesarConId = procesarOnboarding.bind(null, id)

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/onboarding" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-gray-900">{r.nombre as string}</h2>
            <Badge variant={entrada.procesado ? 'secondary' : 'default'}>
              {entrada.procesado ? 'Procesado' : 'Pendiente'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            {new Date(entrada.created_at).toLocaleDateString('es-AR', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>

        {!entrada.procesado && (
          <form action={procesarConId}>
            <Button type="submit">Crear cliente</Button>
          </form>
        )}
      </div>

      {/* Respuestas */}
      <div className="bg-white rounded-lg border divide-y">

        <div className="p-5 grid grid-cols-2 gap-4">
          <Campo label="Nombre" valor={r.nombre} />
          <Campo label="Marca" valor={r.marca} />
          <Campo label="Email" valor={r.email} />
          <Campo label="WhatsApp" valor={r.whatsapp} />
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Negocio</p>
          <Campo label="Descripción" valor={r.descripcion_negocio} />
          <Campo label="Cliente ideal" valor={r.cliente_ideal} />
          <Campo label="Diferenciación" valor={r.diferenciacion} />
          <Campo label="Redes sociales" valor={r.redes_sociales} />
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Proyecto</p>
          <div className="grid grid-cols-3 gap-4">
            <Campo label="Plan" valor={(r.plan as string)?.replace('_', ' ')} />
            <Campo label="Dominio" valor={r.tiene_dominio} />
            <Campo label="Hosting" valor={r.tiene_hosting} />
          </div>
          <Campo label="Logo" valor={r.tiene_logo} />
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Diseño</p>
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Colores preferidos" valor={r.colores_preferencia} />
            <Campo label="Colores a evitar" valor={r.colores_evitar} />
          </div>
          <Campo label="Estilo visual" valor={r.estilo_visual} />
          <Campo label="Secciones" valor={r.secciones} />
          <Campo label="Textos" valor={r.textos_secciones} />
          <Campo label="Referencias web" valor={r.referencias_webs} />
          <Campo label="Fotos (Drive)" valor={r.fotos_drive} />
          <Campo label="Testimonios" valor={r.testimonios} />
          <Campo label="Funcionalidades" valor={r.funcionalidades} />
          <Campo label="Comentarios" valor={r.comentarios} />
        </div>

        <div className="p-5 grid grid-cols-2 gap-4">
          <Campo label="Autoriza portfolio" valor={r.autoriza_portfolio} />
        </div>
      </div>
    </div>
  )
}
