import { notFound } from 'next/navigation'
import { createAnonClient } from '@/lib/supabase/anon'
import { enviarOnboarding } from './actions'
import { SubmitButton } from '@/components/formulario/submit-button'
import { FileInput } from '@/components/formulario/file-input'

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

const redes = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/usuario' },
  { key: 'facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/pagina' },
  { key: 'tiktok',    label: 'TikTok',    placeholder: 'https://tiktok.com/@usuario' },
  { key: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/usuario' },
  { key: 'twitter',   label: 'Twitter',   placeholder: 'https://x.com/usuario' },
  { key: 'otros',     label: 'Otros',     placeholder: 'https://...' },
]

const inputClass = "w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-base text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20"
const labelClass = "block text-base font-medium text-zinc-300 mb-1.5"
const sectionClass = "space-y-5 rounded-xl p-6 border border-white/8 backdrop-blur-md"
const sectionTitleClass = "text-lg font-semibold text-white mb-4 pb-3 border-b border-white/10"

// Radio personalizado: aro blanco + punto central al seleccionar
function RadioOption({ name, value, label, required }: { name: string; value: string; label: string; required?: boolean }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input type="radio" name={name} value={value} required={required} className="sr-only" />
      <div className="w-4 h-4 rounded-full border-2 border-zinc-600 group-has-[:checked]:border-white transition-all shrink-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-white scale-0 group-has-[:checked]:scale-100 transition-transform duration-150" />
      </div>
      <span className="text-sm text-zinc-300 group-has-[:checked]:text-white transition-colors">{label}</span>
    </label>
  )
}

// Checkbox personalizado: cuadrado indigo + checkmark SVG al seleccionar
function CheckOption({ name, value, label, required }: { name: string; value: string; label: string; required?: boolean }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input type="checkbox" name={name} value={value} required={required} className="sr-only" />
      <div className="w-4 h-4 rounded border-2 border-zinc-600 group-has-[:checked]:border-indigo-400 group-has-[:checked]:bg-indigo-400 transition-all shrink-0 flex items-center justify-center">
        <svg className="hidden group-has-[:checked]:block w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-sm text-zinc-300 group-has-[:checked]:text-white transition-colors">{label}</span>
    </label>
  )
}

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAnonClient()

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
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-white">Inicio de Proyecto Web</h1>
        <p className="text-zinc-400 text-base leading-relaxed">
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
                  <option value="+54">AR +54</option>
                  <option value="+55">BR +55</option>
                  <option value="+56">CL +56</option>
                  <option value="+598">UY +598</option>
                  <option value="+595">PY +595</option>
                  <option value="+591">BO +591</option>
                  <option value="+51">PE +51</option>
                  <option value="+57">CO +57</option>
                  <option value="+58">VE +58</option>
                  <option value="+52">MX +52</option>
                  <option value="+34">ES +34</option>
                  <option value="+1">US +1</option>
                  <option value="+44">UK +44</option>
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

          {/* Redes sociales */}
          <div>
            <p className={labelClass}>¿Tenés redes sociales? Seleccioná las que tenés y pegá el link</p>
            <div className="space-y-2.5">
              {redes.map((r) => (
                <div key={r.key} className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer w-28 shrink-0 group">
                    <input type="checkbox" name={`red_${r.key}`} value="si" className="sr-only" />
                    <div className="w-4 h-4 rounded border-2 border-zinc-600 group-has-[:checked]:border-indigo-400 group-has-[:checked]:bg-indigo-400 transition-all shrink-0 flex items-center justify-center">
                      <svg className="hidden group-has-[:checked]:block w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-sm text-zinc-300 group-has-[:checked]:text-white transition-colors">{r.label}</span>
                  </label>
                  <input
                    type="text"
                    name={`${r.key}_url`}
                    placeholder={r.placeholder}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. El proyecto */}
        <div className={sectionClass}>
          <p className={sectionTitleClass}>El proyecto</p>

          <div>
            <p className={labelClass}>¿Qué plan elegiste? *</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {planes.map((p) => (
                <RadioOption key={p.value} name="plan" value={p.value} label={p.label} required />
              ))}
            </div>
          </div>

          <div>
            <p className={labelClass}>¿Ya tenés el dominio registrado?</p>
            <div className="space-y-2">
              <RadioOption name="tiene_dominio" value="si" label="Sí, ya lo tengo." />
              <RadioOption name="tiene_dominio" value="no" label="No, necesito que me asesores / lo registres vos." />
            </div>
          </div>

          <div>
            <p className={labelClass}>¿Ya tenés hosting contratado?</p>
            <div className="space-y-2">
              <RadioOption name="tiene_hosting" value="si" label="Sí, ya tengo." />
              <RadioOption name="tiene_hosting" value="no" label="No, voy a usar el que viene incluido en el plan." />
            </div>
          </div>

          <div>
            <p className={labelClass}>¿Tenés logo profesional? *</p>
            <div className="space-y-2">
              <RadioOption name="tiene_logo" value="si" label="Sí, lo voy a subir a la carpeta de Drive." required />
              <RadioOption name="tiene_logo" value="no" label="No, necesito un logo básico (consultar costo extra)." />
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
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {estilos.map((e) => (
                <RadioOption key={e} name="estilo_visual" value={e.toLowerCase()} label={e} required />
              ))}
            </div>
          </div>

          <div>
            <p className={labelClass}>¿Qué secciones principales necesitás?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {secciones.map((s) => (
                <CheckOption key={s.value} name="secciones" value={s.value} label={s.label} />
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

          <div className="space-y-3">
            <div>
              <label htmlFor="fotos_drive" className={labelClass}>Link de Drive con fotos/imágenes del negocio</label>
              <input id="fotos_drive" name="fotos_drive" placeholder="https://drive.google.com/..." className={inputClass} />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-700" />
              <span className="text-xs text-zinc-500">o subí los archivos directo</span>
              <div className="flex-1 h-px bg-zinc-700" />
            </div>
            <div>
              <label className={labelClass}>Subir fotos / archivos</label>
              <FileInput />
            </div>
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
              <RadioOption name="autoriza_portfolio" value="si" label="Sí — ¡gracias por apoyar el crecimiento!" required />
              <RadioOption name="autoriza_portfolio" value="no" label="No" />
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" name="confirma_plazo" value="si" required className="sr-only" />
            <div className="w-4 h-4 rounded border-2 border-zinc-600 group-has-[:checked]:border-indigo-400 group-has-[:checked]:bg-indigo-400 transition-all shrink-0 mt-0.5 flex items-center justify-center">
              <svg className="hidden group-has-[:checked]:block w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm text-zinc-300 group-has-[:checked]:text-white transition-colors leading-relaxed">
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
