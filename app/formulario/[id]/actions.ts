'use server'

import { redirect } from 'next/navigation'
import { createAnonClient } from '@/lib/supabase/anon'

export async function enviarOnboarding(workspaceId: string, formData: FormData) {
  const supabase = createAnonClient()

  // Verificar que el workspace existe
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .is('deleted_at', null)
    .single()

  if (!workspace) throw new Error('Formulario no disponible.')

  // Subir archivos a Supabase Storage
  const archivos = formData.getAll('fotos_archivos') as File[]
  const fotosArchivos: string[] = []
  for (const archivo of archivos) {
    if (!archivo || archivo.size === 0) continue
    const nombreSanitizado = archivo.name
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // quita acentos
      .replace(/[^a-zA-Z0-9._-]/g, '_')                 // reemplaza caracteres raros
    const path = `onboarding/${workspaceId}/${Date.now()}/${nombreSanitizado}`
    const { error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(path, archivo, { contentType: archivo.type, upsert: false })
    if (!uploadError) fotosArchivos.push(path)
  }

  const respuestas = {
    nombre:              formData.get('nombre'),
    email:               formData.get('email'),
    whatsapp:            `${formData.get('whatsapp_codigo')} ${formData.get('whatsapp_numero')}`.trim(),
    marca:               formData.get('marca'),
    cliente_ideal:       formData.get('cliente_ideal'),
    diferenciacion:      formData.get('diferenciacion'),
    referencias_webs:    formData.get('referencias_webs'),
    descripcion_negocio: formData.get('descripcion_negocio'),
    plan:                formData.get('plan'),
    tiene_dominio:       formData.get('tiene_dominio'),
    tiene_hosting:       formData.get('tiene_hosting'),
    tiene_logo:          formData.get('tiene_logo'),
    colores_preferencia: formData.get('colores_preferencia'),
    colores_evitar:      formData.get('colores_evitar'),
    estilo_visual:       formData.get('estilo_visual'),
    secciones:           formData.getAll('secciones'),
    textos_secciones:    formData.get('textos_secciones'),
    redes_sociales:      (() => {
      const obj: Record<string, string> = {}
      for (const red of ['instagram', 'facebook', 'tiktok', 'linkedin', 'twitter', 'otros']) {
        const url = (formData.get(`${red}_url`) as string)?.trim()
        if (url) obj[red] = url
      }
      return Object.keys(obj).length > 0 ? obj : null
    })(),
    funcionalidades:     formData.get('funcionalidades'),
    fotos_drive:         formData.get('fotos_drive'),
    testimonios:         formData.get('testimonios'),
    comentarios:         formData.get('comentarios'),
    autoriza_portfolio:  formData.get('autoriza_portfolio'),
    fotos_archivos:      fotosArchivos.length > 0 ? fotosArchivos : null,
  }

  const { error } = await supabase
    .from('onboarding')
    .insert({
      workspace_id: workspaceId,
      respuestas,
      procesado: false,
    })

  if (error) throw new Error(error.message)

  redirect(`/formulario/${workspaceId}/gracias`)
}
