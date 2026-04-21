import Image from 'next/image'
import { ParticleBackground } from '@/components/formulario/particle-background'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-white" style={{ background: '#0a0a0a' }}>
      <ParticleBackground />

      {/* Contenido por encima del canvas */}
      <div className="relative" style={{ zIndex: 1 }}>
        <header className="px-6 py-5">
          <Image
            src="/logo.png"
            alt="Argentina Webdesign"
            width={160}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
        </header>
        <main className="max-w-3xl mx-auto px-6 py-10">
          {children}
        </main>
      </div>
    </div>
  )
}
