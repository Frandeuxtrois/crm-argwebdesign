import Image from 'next/image'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="px-6 py-5 border-b border-zinc-800">
        <Image
          src="/logo.png"
          alt="Argentina Webdesign"
          width={160}
          height={40}
          className="h-10 w-auto object-contain"
          priority
        />
      </header>
      <main className="max-w-2xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  )
}
