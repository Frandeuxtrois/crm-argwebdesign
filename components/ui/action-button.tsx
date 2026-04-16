'use client'

import { useFormStatus } from 'react-dom'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import type { VariantProps } from 'class-variance-authority'

interface ActionButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode
  pendingText?: string
  className?: string
}

export function ActionButton({ children, pendingText = 'Procesando...', variant, size, className }: ActionButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(buttonVariants({ variant, size }), 'disabled:opacity-60 disabled:cursor-not-allowed', className)}
    >
      {pending ? pendingText : children}
    </button>
  )
}
