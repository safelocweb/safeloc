'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { cn } from '@/lib/utils'
import { formatCpf } from '@/lib/format-cpf'
import { useNonPassiveWheelScroll } from '@/lib/use-non-passive-wheel-scroll'
import { useUser } from '@/app/providers/user-provider'
import { notificacaoService, Notificacao } from '@/app/services/notificacao.service'
import { ROUTES } from '@/shared/enums/routes.enum'

const INTERVALO_ATUALIZACAO_MS = 30000

function tempoRelativo(dataISO: string): string {
    const minutos = Math.floor((Date.now() - new Date(dataISO).getTime()) / 60000)
    if (minutos < 1) return 'agora'
    if (minutos < 60) return `há ${minutos} min`
    const horas = Math.floor(minutos / 60)
    if (horas < 24) return `há ${horas}h`
    return `há ${Math.floor(horas / 24)}d`
}

function labelNotificacao(notificacao: Notificacao): string {
    const nome = notificacao.contestacao.ocorrencia.nomeInquilinoInformado
    const cpf = formatCpf(notificacao.contestacao.ocorrencia.cpfInquilino)
    if (notificacao.tipo === 'CONTESTACAO_ABERTA') {
        return `Nova contestação aberta para ${nome} (${cpf})`
    }
    const imobiliaria =
        notificacao.contestacao.imobiliaria.nomeFantasia ?? notificacao.contestacao.imobiliaria.razaoSocial
    return `${imobiliaria} enviou documentos na contestação de ${nome} (${cpf})`
}

export function NotificacaoSino() {
    const { usuario } = useUser()
    const router = useRouter()
    const queryClient = useQueryClient()
    const [open, setOpen] = useState(false)
    const listRef = useNonPassiveWheelScroll<HTMLDivElement>()

    const { data } = useQuery({
        queryKey: ['notificacoes'],
        queryFn: () => notificacaoService.listar(),
        refetchInterval: INTERVALO_ATUALIZACAO_MS,
        enabled: !!usuario
    })

    const marcarLidaMutation = useMutation({
        mutationFn: (id: number) => notificacaoService.marcarLida(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificacoes'] })
    })

    const marcarTodasMutation = useMutation({
        mutationFn: () => notificacaoService.marcarTodasLidas(),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificacoes'] })
    })

    if (!usuario) return null

    function abrirNotificacao(notificacao: Notificacao) {
        if (!notificacao.lida) marcarLidaMutation.mutate(notificacao.id)
        setOpen(false)
        router.push(`${ROUTES.CONTESTACAO}?contestacaoId=${notificacao.contestacao.id}`)
    }

    const naoLidas = data?.naoLidas ?? 0

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label="Notificações"
                    className="relative inline-flex shrink-0 items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    <Bell className="h-4 w-4" />
                    {naoLidas > 0 && (
                        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
                            {naoLidas > 9 ? '9+' : naoLidas}
                        </span>
                    )}
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b border-border p-3">
                    <p className="text-sm font-semibold">Notificações</p>
                    {naoLidas > 0 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => marcarTodasMutation.mutate()}>
                            Marcar todas como lidas
                        </Button>
                    )}
                </div>
                <div ref={listRef} className="max-h-96 overflow-y-auto">
                    {!data || data.notificacoes.length === 0 ? (
                        <p className="p-4 text-center text-sm text-muted-foreground">Nenhuma notificação por aqui.</p>
                    ) : (
                        data.notificacoes.map((notificacao) => (
                            <button
                                key={notificacao.id}
                                type="button"
                                onClick={() => abrirNotificacao(notificacao)}
                                className={cn(
                                    'flex w-full flex-col gap-1 border-b border-border p-3 text-left text-sm transition-colors last:border-b-0 hover:bg-accent',
                                    !notificacao.lida && 'bg-primary/5'
                                )}
                            >
                                <span className="flex items-start gap-2">
                                    {!notificacao.lida && (
                                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                    )}
                                    <span className={notificacao.lida ? 'text-muted-foreground' : ''}>
                                        {labelNotificacao(notificacao)}
                                    </span>
                                </span>
                                <span className="pl-3.5 text-xs text-muted-foreground">
                                    {tempoRelativo(notificacao.createdAt)}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
