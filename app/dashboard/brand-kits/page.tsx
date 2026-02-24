'use client'

import { useEffect } from 'react'
import { Palette, ArrowRight } from 'lucide-react'
import { Button } from '@/components/atoms/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

export default function BrandKitsPage() {
  const router = useRouter()

  useEffect(() => {
    toast.info('Brand Kits agora são gerenciados por perfil')
  }, [])
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center max-w-lg">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/10">
          <Palette className="h-10 w-10 text-primary-500" />
        </div>

        <h2 className="text-2xl font-bold text-neutral-50 mb-3">
          Brand Kits foram movidos! 🎨
        </h2>

        <p className="text-neutral-400 mb-6">
          Agora cada <span className="font-semibold text-neutral-300">perfil do Instagram</span> tem seu próprio Brand Kit.
        </p>

        <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-neutral-300 mb-2">
            <strong>Como acessar:</strong>
          </p>
          <ol className="text-sm text-neutral-400 space-y-1 list-decimal list-inside">
            <li>Vá para o Dashboard</li>
            <li>Clique em um perfil auditado</li>
            <li>Clique no botão <strong>&quot;Brand Kit&quot;</strong></li>
          </ol>
        </div>

        <Link href="/dashboard">
          <Button size="lg">
            <ArrowRight className="h-5 w-5 mr-2" />
            Ir para Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
