import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { ActionButton } from '@/components/ui/action-button'
import { procesarOnboarding, asociarOnboarding, ignorarOnboarding } from '../actions'
import { ArrowLeft, ExternalLink, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const planLabel: Record<string, string> = {
  express:          'Web Express',
  landing:          'Landing Page',
  economica:        'Económica',
  autogestionable:  'Auto-Gestionable',
  ecommerce_basico: 'E-commerce Básico',
  ecommerce_full:   'E-commerce Full',
  personalizada:    'Personalizada',
}

function Campo({ label, valor }: { label: string; valor: unknown }) {
  if (!valor || (Array.isArray(valor) && valor.length === 0)) return null

  // Objeto plano (ej: redes_sociales { instagram: "url", ... })
  if (typeof valor === 'object' && !Array.isArray(valor)) {
    const entradas = Object.entries(valor as Record<string, string>).filter(([, v]) => !!v)
    if (!entradas.length) return null
    return (
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <div className="space-y-1">
          {entradas.map(([red, url]) => (
            <div key={red} className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-500 capitalize w-20 shrink-0">{red}:</span>
              <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 truncate">
                {url} <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const texto = Array.isArray(valor) ? valor.join(', ') : String(valor)
  const esUrl = texto.startsWith('http://') || texto.startsWith('https://')

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      {esUrl ? (
        <a href={texto} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          {texto} <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
      ) : (
        <p className="text-sm text-gray-900 whitespace-pre-wrap">{texto}</p>
      )}
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
    .select('*, clientes(id, nombre, marca)')
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .single()

  if (!entrada) notFound()

  const r = entrada.respuestas as Record<string, unknown>

  // Signed URLs para archivos subidos directamente
  const fotosRutas = r.fotos_archivos as string[] | null
  const fotosArchivos: { nombre: string; url: string }[] = []
  if (fotosRutas && fotosRutas.length > 0) {
    for (const ruta of fotosRutas) {
      const { data } = await supabase.storage.from('documentos').createSignedUrl(ruta, 3600)
      if (data?.signedUrl) {
        fotosArchivos.push({ nombre: ruta.split('/').pop() ?? ruta, url: data.signedUrl })
      }
    }
  }

  const procesarConId = procesarOnboarding.bind(null, id)
  const cliente = entrada.procesado
    ? (Array.isArray(entrada.clientes) ? entrada.clientes[0] : entrada.clientes) as { id: string; nombre: string; marca: string } | null
    : null

  // Verificar si el email ya existe como cliente (solo si no está procesado)
  const clienteExistente = !entrada.procesado
    ? await supabase
        .from('clientes')
        .select('id, nombre, marca')
        .eq('workspace_id', workspaceId)
        .eq('email', r.email as string)
        .is('deleted_at', null)
        .maybeSingle()
        .then(({ data }) => data)
    : null

  const asociarConId = clienteExistente
    ? asociarOnboarding.bind(null, id, clienteExistente.id)
    : null
  const ignorarConId = ignorarOnboarding.bind(null, id)

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/onboarding" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-gray-900">{r.marca as string}</h2>
            <Badge variant={entrada.procesado ? 'secondary' : 'default'}>
              {entrada.procesado ? 'Procesado' : 'Pendiente'}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">
            {r.nombre as string} — {new Date(entrada.created_at).toLocaleDateString('es-AR', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>

        {entrada.procesado && cliente ? (
          <Link href={`/clientes/${cliente.id}`} className={cn(buttonVariants({ variant: 'outline' }))}>
            Ver cliente
          </Link>
        ) : clienteExistente ? null : (
          <form action={procesarConId}>
            <ActionButton>Crear cliente y proyecto</ActionButton>
          </form>
        )}
      </div>

      {/* Aviso: cliente existente con ese email */}
      {clienteExistente && asociarConId && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-sm font-semibold text-amber-900">
              El email <span className="font-mono">{r.email as string}</span> ya existe como cliente
            </p>
          </div>

          {/* Comparación lado a lado */}
          <div className="grid grid-cols-2 divide-x divide-amber-200">
            <div className="p-4 space-y-1">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">Cliente existente</p>
              <p className="text-sm font-semibold text-gray-900">{clienteExistente.marca}</p>
              <p className="text-sm text-gray-600">{clienteExistente.nombre}</p>
              <Link href={`/clientes/${clienteExistente.id}`} className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1">
                Ver cliente <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-4 space-y-1">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">Este formulario</p>
              <p className="text-sm font-semibold text-gray-900">{r.marca as string}</p>
              <p className="text-sm text-gray-600">{r.nombre as string}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(entrada.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-amber-200 bg-amber-100/50">
            <form action={asociarConId}>
              <ActionButton size="sm">
                Asociar proyecto a {clienteExistente.marca}
              </ActionButton>
            </form>
            <form action={procesarConId}>
              <ActionButton size="sm" variant="outline">
                Es otra persona — crear cliente nuevo
              </ActionButton>
            </form>
            <form action={ignorarConId} className="ml-auto">
              <ActionButton size="sm" variant="ghost" className="text-gray-500 text-xs">
                Ignorar formulario
              </ActionButton>
            </form>
          </div>
        </div>
      )}

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
            <Campo label="Plan" valor={planLabel[r.plan as string] ?? r.plan} />
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
          {fotosArchivos.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Archivos subidos</p>
              <div className="flex flex-wrap gap-2">
                {fotosArchivos.map((f) => (
                  <a
                    key={f.url}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-md transition-colors"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    {f.nombre}
                  </a>
                ))}
              </div>
            </div>
          )}
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
