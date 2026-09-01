'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from './providers/user-provider'
import { ROUTES } from '@/shared/enums/routes.enum'

export default function HomePage() {
    const { usuario, carregando } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (carregando) return
        if (!usuario) {
            router.replace(ROUTES.LOGIN)
            return
        }
        const usuarioPadrao = usuario.role === 'IMOBILIARIA' && usuario.papel === 'PADRAO'
        router.replace(usuarioPadrao ? ROUTES.CONSULTAR : ROUTES.DASHBOARD)
    }, [carregando, usuario, router])

    return null
}
