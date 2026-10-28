'use client'

import { Building2, FileClock, FileSearch, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useUser } from '@/app/providers/user-provider'
import { ROUTES } from '@/shared/enums/routes.enum'
import { ImobiliariasTab } from './_components/imobiliarias-tab'
import { UsuariosTab } from './_components/usuarios-tab'
import { OcorrenciasTab } from './_components/ocorrencias-tab'
import { LogsTab } from './_components/logs-tab'

const ABAS = [
    { id: 'imobiliarias', label: 'Imobiliárias', icon: Building2 },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'ocorrencias', label: 'Ocorrências', icon: FileSearch },
    { id: 'logs', label: 'Logs', icon: FileClock }
] as const

type AbaId = (typeof ABAS)[number]['id']

export default function AdministradorPage() {
    const { usuario, carregando } = useUser()
    const router = useRouter()
    const [aba, setAba] = useState<AbaId>('imobiliarias')

    useEffect(() => {
        if (!carregando && usuario && usuario.role !== 'MASTER') {
            router.replace(ROUTES.CONSULTAR)
        }
    }, [carregando, usuario, router])

    if (carregando || !usuario || usuario.role !== 'MASTER') {
        return null
    }

    return (
        <div className="flex min-h-full flex-col gap-6 md:h-full md:min-h-0">
            <div className="shrink-0 rounded-xl border border-border bg-card/95 px-5 py-4 shadow-lg shadow-black/10 backdrop-blur">
                <h1 className="text-2xl font-bold tracking-tight">Administrador</h1>
                <p className="text-sm text-muted-foreground">
                    Gerencie imobiliárias, usuários de qualquer imobiliária, acompanhe todas as
                    ocorrências registradas e os logs de auditoria da plataforma
                </p>
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-card p-1 md:flex md:w-fit md:max-w-full md:flex-wrap md:shrink-0">
                {ABAS.map((item) => {
                    const Icon = item.icon
                    const ativa = aba === item.id
                    return (
                        <button
                            key={item.id}
                            onClick={() => setAba(item.id)}
                            className={cn(
                                'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                ativa
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    )
                })}
            </div>

            <div className="flex-1 md:min-h-0">
                {aba === 'imobiliarias' && <ImobiliariasTab />}
                {aba === 'usuarios' && <UsuariosTab />}
                {aba === 'ocorrencias' && <OcorrenciasTab />}
                {aba === 'logs' && <LogsTab />}
            </div>
        </div>
    )
}
