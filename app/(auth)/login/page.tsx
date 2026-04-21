import Image from 'next/image'
import { PasswordInput } from '@/components/auth/password-input'
import { loginAction } from './actions'

const field = 'w-full h-9 rounded-lg bg-zinc-900 border border-zinc-800 px-3 text-sm text-white placeholder:text-zinc-600 outline-none'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="w-full max-w-sm space-y-8 px-4">
      <div className="flex justify-center">
        <Image
          src="/logo.png"
          alt="Argentina Webdesign"
          width={340}
          height={180}
          className="object-contain"
          priority
        />
      </div>

      <form action={loginAction} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs uppercase tracking-wider text-zinc-500">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            required
            autoComplete="email"
            className={field}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs uppercase tracking-wider text-zinc-500">Contraseña</label>
          <PasswordInput />
        </div>

        {error && (
          <p className="text-sm text-red-400">Email o contraseña incorrectos.</p>
        )}

        <button
          type="submit"
          className="w-full mt-2 h-9 rounded-lg text-sm text-white/80 bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 hover:text-white transition-all"
        >
          Ingresar
        </button>
      </form>
    </div>
  )
}
