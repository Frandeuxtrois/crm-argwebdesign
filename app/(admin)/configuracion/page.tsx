import { createClient } from '@/lib/supabase/server'
import { getWorkspaceId } from '@/lib/workspace'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { guardarConfiguracion } from './actions'
import { CopyFormLink } from '@/components/dashboard/copy-form-link'
import { Link2 } from 'lucide-react'

export default async function ConfiguracionPage() {
  const supabase = await createClient()
  const workspaceId = await getWorkspaceId()

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Configuración</h2>
        <p className="text-sm text-gray-500 mt-1">Datos de tu agencia</p>
      </div>

      <form action={guardarConfiguracion} className="bg-white rounded-lg border p-6 space-y-5">

        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre de la agencia *</Label>
          <Input id="nombre" name="nombre" required defaultValue={workspace?.nombre ?? ''} placeholder="Argentina Webdesign" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email de contacto</Label>
          <Input id="email" name="email" type="email" defaultValue={workspace?.email ?? ''} placeholder="hola@agencia.com" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" name="whatsapp" defaultValue={workspace?.whatsapp ?? ''} placeholder="+54 9 11 1234-5678" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sitio_web">Sitio web</Label>
          <Input id="sitio_web" name="sitio_web" type="url" defaultValue={workspace?.sitio_web ?? ''} placeholder="https://argentinawebdesign.com.ar" />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit">Guardar cambios</Button>
        </div>
      </form>

      {/* Link del formulario */}
      <div className="bg-white rounded-lg border px-5 py-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Link2 className="h-4 w-4 text-gray-400" />
          Link del formulario de onboarding
        </div>
        <CopyFormLink workspaceId={workspaceId} />
      </div>
    </div>
  )
}
