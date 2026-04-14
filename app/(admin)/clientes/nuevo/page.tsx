import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { crearCliente } from '../actions'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NuevoClientePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clientes" className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Nuevo cliente</h2>
          <p className="text-sm text-gray-500">Completá los datos del cliente</p>
        </div>
      </div>

      <form action={crearCliente} className="bg-white rounded-lg border p-6 space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre y apellido *</Label>
            <Input id="nombre" name="nombre" required placeholder="Juan Pérez" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="marca">Marca / Negocio *</Label>
            <Input id="marca" name="marca" required placeholder="Panadería El Sol" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" required placeholder="juan@ejemplo.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input id="whatsapp" name="whatsapp" required placeholder="+54 9 11 1234-5678" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="descripcion_negocio">Descripción del negocio</Label>
          <Textarea
            id="descripcion_negocio"
            name="descripcion_negocio"
            placeholder="¿A qué se dedica el cliente?"
            rows={3}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="datos_fiscales">Datos fiscales</Label>
          <Input id="datos_fiscales" name="datos_fiscales" placeholder="CUIT / Razón social" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notas">Notas internas</Label>
          <Textarea
            id="notas"
            name="notas"
            placeholder="Notas privadas sobre el cliente..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href="/clientes" className={cn(buttonVariants({ variant: 'outline' }))}>
            Cancelar
          </Link>
          <Button type="submit">Guardar cliente</Button>
        </div>
      </form>
    </div>
  )
}
