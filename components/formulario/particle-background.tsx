'use client'

import { useEffect, useRef } from 'react'

const PARTICLE_COLOR = '#888888'
const MAX_DISTANCE = 120
const SPEED = 0.5
const DENSITY = 4000

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    let mouseX = -9999
    let mouseY = -9999
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize', resize)

    interface Particle { x: number; y: number; vx: number; vy: number }

    const createParticles = (): Particle[] => {
      const count = Math.floor((canvas.width * canvas.height) / DENSITY)
      return Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
      }))
    }

    const particles = createParticles()
    let animId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -20 || p.x > canvas.width + 20) p.vx *= -1
        if (p.y < -20 || p.y > canvas.height + 20) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = PARTICLE_COLOR
        ctx.globalAlpha = 0.7
        ctx.fill()
      }

      const all = [...particles, { x: mouseX, y: mouseY }]
      for (let i = 0; i < all.length; i++) {
        for (let j = i + 1; j < all.length; j++) {
          const dx = all[i].x - all[j].x
          const dy = all[i].y - all[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DISTANCE) {
            ctx.beginPath()
            ctx.strokeStyle = PARTICLE_COLOR
            ctx.globalAlpha = (MAX_DISTANCE - dist) / MAX_DISTANCE
            ctx.lineWidth = 0.7
            ctx.moveTo(all[i].x, all[i].y)
            ctx.lineTo(all[j].x, all[j].y)
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        background: '#0a0a0a',
      }}
    />
  )
}
