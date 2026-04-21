'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function FloatingThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Cambiar tema"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 9999,
        width: '60px',
        height: '32px',
        borderRadius: '30px',
        padding: '6px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        border: isDark ? '1px solid rgba(238,69,64,0.2)' : '1px solid rgba(255,255,255,0.1)',
        background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <span
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: isDark ? '#ee4540' : '#1a1a1a',
          boxShadow: isDark ? '0 0 10px rgba(238,69,64,0.4)' : 'none',
          transform: isDark ? 'translateX(28px)' : 'translateX(0)',
          transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          display: 'block',
          flexShrink: 0,
        }}
      />
    </button>
  )
}
