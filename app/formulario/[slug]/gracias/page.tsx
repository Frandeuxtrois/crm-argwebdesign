import { CircleCheck } from 'lucide-react'

export default function GraciasPage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 space-y-4">
      <CircleCheck className="h-14 w-14 text-green-400" />
      <h1 className="text-2xl font-bold text-white">¡Formulario enviado!</h1>
      <p className="text-zinc-400 text-sm max-w-sm leading-relaxed">
        Recibimos toda la información. En breve nos ponemos en contacto para
        coordinar los próximos pasos.
      </p>
      <p className="text-zinc-600 text-xs pt-4">Argentina Webdesign</p>
    </div>
  )
}
