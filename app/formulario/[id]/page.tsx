import { notFound } from 'next/navigation'
import { createAnonClient } from '@/lib/supabase/anon'
import { enviarOnboarding } from './actions'
import { SubmitButton } from '@/components/formulario/submit-button'

const secciones = [
  { value: 'inicio',      label: 'Inicio / Hero' },
  { value: 'servicios',   label: 'Servicios / Productos' },
  { value: 'nosotros',    label: 'Sobre nosotros / Quiénes somos' },
  { value: 'galeria',     label: 'Galería de fotos/videos' },
  { value: 'contacto',    label: 'Formulario de contacto' },
  { value: 'whatsapp',    label: 'Botón de WhatsApp flotante' },
  { value: 'mapa',        label: 'Mapa de Google Maps' },
  { value: 'testimonios', label: 'Testimonios de clientes' },
]

const planes = [
  { value: 'express',          label: 'Web Express' },
  { value: 'landing',          label: 'Landing Page' },
  { value: 'economica',        label: 'Económica' },
  { value: 'autogestionable',  label: 'Auto-Gestionable' },
  { value: 'ecommerce_basico', label: 'E-commerce Básico' },
  { value: 'ecommerce_full',   label: 'E-commerce Full' },
  { value: 'personalizada',    label: 'Personalizada' },
]

const estilos = ['Minimalista', 'Moderno', 'Elegante', 'Divertido', 'Corporativo', 'Artesanal']

const inputClass = "w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500"
const labelClass = "block text-sm font-medium text-zinc-300 mb-1.5"
const sectionClass = "space-y-5 bg-zinc-900 rounded-xl p-6 border border-zinc-800"
const sectionTitleClass = "text-base font-semibold text-white mb-4 pb-3 border-b border-zinc-800"

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAnonClient()

  // Verificar que el workspace existe por ID
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, nombre')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!workspace) notFound()

  const action = enviarOnboarding.bind(null, id)

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Inicio de Proyecto Web</h1>
        <p className="text-zinc-400 text-sm leading-relaxed">
          ¡Hola! Qué bueno que decidiste dar el paso para digitalizar tu negocio.
          Para cumplir con los plazos de entrega y que el diseño quede perfecto,
          completá este formulario con la mayor precisión posible.
        </p>
      </div>

      <form action={action} className="space-y-6">

        {/* 1. Datos de contacto */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Datos de contacto</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className={labelClass}>Nombre y apellido *</label>
              <input id="nombre" name="nombre" required placeholder="Juan Pérez" className={inputClass} />
            </div>
            <div>
              <label htmlFor="marca" className={labelClass}>Nombre de la marca o negocio *</label>
              <input id="marca" name="marca" required placeholder="Panadería El Sol" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className={labelClass}>Mail de contacto *</label>
              <input id="email" name="email" type="email" required placeholder="juan@ejemplo.com" className={inputClass} />
            </div>
            <div>
              <label htmlFor="whatsapp_numero" className={labelClass}>WhatsApp de contacto *</label>
              <div className="flex gap-2">
                <select
                  name="whatsapp_codigo"
                  defaultValue="+54"
                  className="rounded-md bg-zinc-800 border border-zinc-700 px-2 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-500 shrink-0"
                >
                  <option value="+54">🇦🇷 +54</option>
                  <option value="+55">🇧🇷 +55</option>
                  <option value="+56">🇨🇱 +56</option>
                  <option value="+598">🇺🇾 +598</option>
                  <option value="+595">🇵🇾 +595</option>
                  <option value="+591">🇧🇴 +591</option>
                  <option value="+51">🇵🇪 +51</option>
                  <option value="+57">🇨🇴 +57</option>
                  <option value="+58">🇻🇪 +58</option>
                  <option value="+52">🇲🇽 +52</option>
                  <option value="+34">🇪🇸 +34</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                </select>
                <input
                  id="whatsapp_numero"
                  name="whatsapp_numero"
                  required
                  placeholder="9 11 1234-5678"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Tu negocio */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Tu negocio</p>

          <div>
            <label htmlFor="descripcion_negocio" className={labelClass}>¿A qué se dedica tu negocio? *</label>
            <textarea id="descripcion_negocio" name="descripcion_negocio" required rows={3} placeholder="Breve descripción de tu negocio..." className={inputClass} />
          </div>

          <div>
            <label htmlFor="cliente_ideal" className={labelClass}>¿Quién es tu cliente ideal? (a quién le vendés) *</label>
            <textarea id="cliente_ideal" name="cliente_ideal" required rows={3} placeholder="Ej: mujeres de 25-45 años que buscan ropa sustentable..." className={inputClass} />
          </div>

          <div>
            <label htmlFor="diferenciacion" className={labelClass}>¿Qué te diferencia de la competencia? (1-2 frases) *</label>
            <textarea id="diferenciacion" name="diferenciacion" required rows={2} placeholder="Lo que hace único a tu negocio..." className={inputClass} />
          </div>

          <div>
            <label htmlFor="redes_sociales" className={labelClass}>¿Tenés redes sociales? Pegá los links acá</label>
            <textarea id="redes_sociales" name="redes_sociales" rows={2} placeholder="Instagram, Facebook, LinkedIn..." className={inputClass} />
          </div>
        </div>

        {/* 3. El proyecto */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>El proyecto</p>

          <div>
            <p className={labelClass}>¿Qué plan elegiste? *</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {planes.map((p) => (
                <label key={p.value} className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="radio" name="plan" value={p.value} required className="accent-white" />
                  <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className={labelClass}>¿Ya tenés el dominio registrado?</p>
            <div className="space-y-2">
              {[
                { value: 'si', label: 'Sí, ya lo tengo.' },
                { value: 'no', label: 'No, necesito que me asesores / lo registres vos.' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="radio" name="tiene_dominio" value={opt.value} className="accent-white" />
                  <span className="text-sm text-zinc-300">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className={labelClass}>¿Ya tenés hosting contratado?</p>
            <div className="space-y-2">
              {[
                { value: 'si', label: 'Sí, ya tengo.' },
                { value: 'no', label: 'No, voy a usar el que viene incluido en el plan.' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="radio" name="tiene_hosting" value={opt.value} className="accent-white" />
                  <span className="text-sm text-zinc-300">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className={labelClass}>¿Tenés logo profesional? *</p>
            <div className="space-y-2">
              {[
                { value: 'si', label: 'Sí, lo voy a subir a la carpeta de Drive.' },
                { value: 'no', label: 'No, necesito un logo básico (consultar costo extra).' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="radio" name="tiene_logo" value={opt.value} required className="accent-white" />
                  <span className="text-sm text-zinc-300">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Diseño y contenido */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Diseño y contenido</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="colores_preferencia" className={labelClass}>Colores de preferencia *</label>
              <input id="colores_preferencia" name="colores_preferencia" required placeholder='Ej: "Azul marino y blanco"' className={inputClass} />
            </div>
            <div>
              <label htmlFor="colores_evitar" className={labelClass}>Colores que NO querés</label>
              <input id="colores_evitar" name="colores_evitar" placeholder="Colores a evitar..." className={inputClass} />
            </div>
          </div>

          <div>
            <p className={labelClass}>Estilo visual deseado *</p>
            <div className="flex flex-wrap gap-2">
              {estilos.map((e) => (
                <label key={e} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="estilo_visual" value={e.toLowerCase()} required className="accent-white" />
                  <span className="text-sm text-zinc-300">{e}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className={labelClass}>¿Qué secciones principales necesitás?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {secciones.map((s) => (
                <label key={s.value} className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" name="secciones" value={s.value} className="accent-white" />
                  <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="textos_secciones" className={labelClass}>Textos de cada sección</label>
            <textarea id="textos_secciones" name="textos_secciones" rows={4} placeholder="Si ya tenés los textos redactados, pegálos acá..." className={inputClass} />
          </div>

          <div>
            <label htmlFor="referencias_webs" className={labelClass}>Pegá 2 o 3 links de webs que te gusten (referencias)</label>
            <textarea id="referencias_webs" name="referencias_webs" rows={3} placeholder="https://..." className={inputClass} />
          </div>

          <div>
            <label htmlFor="fotos_drive" className={labelClass}>Link de Drive con fotos/imágenes del negocio *</label>
            <input id="fotos_drive" name="fotos_drive" required placeholder="https://drive.google.com/..." className={inputClass} />
          </div>

          <div>
            <label htmlFor="testimonios" className={labelClass}>Testimonios de clientes reales (si tenés)</label>
            <textarea id="testimonios" name="testimonios" rows={3} placeholder="Pegá los testimonios acá..." className={inputClass} />
          </div>

          <div>
            <label htmlFor="funcionalidades" className={labelClass}>¿Necesitás alguna funcionalidad especial?</label>
            <textarea id="funcionalidades" name="funcionalidades" rows={2} placeholder="WhatsApp flotante, reservas, catálogo, carrito, etc..." className={inputClass} />
          </div>

          <div>
            <label htmlFor="comentarios" className={labelClass}>Comentarios o pedidos adicionales</label>
            <textarea id="comentarios" name="comentarios" rows={3} placeholder="Cualquier cosa extra que quieras aclarar..." className={inputClass} />
          </div>
        </div>

        {/* 5. Confirmaciones */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Confirmaciones</p>

          <div>
            <p className={labelClass}>¿Autorizás el uso del proyecto en el portfolio? *</p>
            <div className="space-y-2">
              {[
                { value: 'si', label: 'Sí — ¡gracias por apoyar el crecimiento!' },
                { value: 'no', label: 'No' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="radio" name="autoriza_portfolio" value={opt.value} required className="accent-white" />
                  <span className="text-sm text-zinc-300">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" name="confirma_plazo" value="si" required className="accent-white mt-0.5 shrink-0" />
            <span className="text-sm text-zinc-300 leading-relaxed">
              Confirmo que entiendo que el plazo de entrega comienza a contar desde que envío este formulario
              <strong className="text-white"> completo</strong> con todos los textos e imágenes. *
            </span>
          </label>
        </div>

        <SubmitButton />

      </form>
    </div>
  )
}
