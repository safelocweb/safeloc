'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Building2, MessageSquareWarning, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CpfInput } from '@/components/ui/cpf-input'
import { ListagemCard } from '@/components/ui/listagem-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCpf, isCpfComplete } from '@/lib/format-cpf'
import { useDelayedLoading } from '@/lib/use-delayed-loading'
import { useUser } from '@/app/providers/user-provider'
import { imobiliariaService } from '@/app/services/imobiliaria.service'
import { contestacaoService } from '@/app/services/contestacao.service'
import { ROUTES } from '@/shared/enums/routes.enum'
import { StatusContestacao } from '@/shared/constants/status-contestacao'
import { formatarTiposOcorrencia } from '@/shared/constants/tipo-ocorrencia'
import { AbrirContestacaoDialog } from './abrir-contestacao-dialog'
import { ContestacaoDetalheDialog } from './contestacao-detalhe-dialog'
import { ContestacaoStatusBadge } from './contestacao-status-badge'

const TODAS_IMOBILIARIAS = 'todas'
const TODOS_STATUS = 'todos'
const PAGE_SIZE = 20

export function ContestacaoMasterView({ contestacaoIdParaAbrir }: { contestacaoIdParaAbrir: number | null }) {
    const { usuario } = useUser()
    const router = useRouter()
    const [filtroImobiliaria, setFiltroImobiliaria] = useState(TODAS_IMOBILIARIAS)
    const [filtroStatus, setFiltroStatus] = useState(TODOS_STATUS)
    const [filtroCpf, setFiltroCpf] = useState('')
    const [page, setPage] = useState(1)
    const [ultimaAcao, setUltimaAcao] = useState<'anterior' | 'proxima' | 'filtro' | null>(null)
    const [dialogAbrirAberto, setDialogAbrirAberto] = useState(false)
    const [contestacaoSelecionadaId, setContestacaoSelecionadaId] = useState<number | null>(null)

    useEffect(() => {
        if (contestacaoIdParaAbrir !== null) {
            setContestacaoSelecionadaId(contestacaoIdParaAbrir)
            router.replace(ROUTES.CONTESTACAO)
        }
    }, [contestacaoIdParaAbrir, router])

    const { data: imobiliarias } = useQuery({
        queryKey: ['admin-imobiliarias'],
        queryFn: () => imobiliariaService.listar()
    })

    const cpfCompleto = isCpfComplete(filtroCpf) ? filtroCpf.replace(/\D/g, '') : undefined

    const { data: resultado, isLoading, isFetching } = useQuery({
        queryKey: ['contestacoes', filtroImobiliaria, filtroStatus, cpfCompleto, page],
        queryFn: () =>
            contestacaoService.listar({
                imobiliariaId: filtroImobiliaria === TODAS_IMOBILIARIAS ? undefined : Number(filtroImobiliaria),
                status: filtroStatus === TODOS_STATUS ? undefined : (filtroStatus as StatusContestacao),
                cpf: cpfCompleto,
                page,
                pageSize: PAGE_SIZE
            }),
        placeholderData: keepPreviousData
    })

    const mostrarCarregando = useDelayedLoading(isFetching)
    const totalPaginas = resultado ? Math.max(1, Math.ceil(resultado.total / PAGE_SIZE)) : 1

    function aplicarFiltro(setter: (value: string) => void) {
        return (value: string) => {
            setUltimaAcao('filtro')
            setter(value)
            setPage(1)
        }
    }

    if (!usuario) return null

    return (
        <>
            <ListagemCard
                title="Contestações Registradas"
                description={`${resultado?.total ?? 0} contestação(ões) no total`}
                isLoading={isLoading}
                isEmpty={resultado?.contestacoes.length === 0}
                emptyIcon={MessageSquareWarning}
                emptyMessage="Nenhuma contestação encontrada com esses filtros."
                pagination={{
                    page,
                    totalPaginas,
                    mostrarCarregando,
                    ultimaAcao,
                    onAnterior: () => {
                        setUltimaAcao('anterior')
                        setPage((p) => p - 1)
                    },
                    onProxima: () => {
                        setUltimaAcao('proxima')
                        setPage((p) => p + 1)
                    }
                }}
                headerActions={
                    <>
                        <div className="w-full md:w-44">
                            <CpfInput
                                value={filtroCpf}
                                onChange={(event) => {
                                    setUltimaAcao('filtro')
                                    setFiltroCpf(event.target.value)
                                    setPage(1)
                                }}
                                placeholder="Buscar por CPF"
                            />
                        </div>
                        <Select
                            value={filtroImobiliaria}
                            onValueChange={aplicarFiltro(setFiltroImobiliaria)}
                            disabled={mostrarCarregando}
                        >
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={TODAS_IMOBILIARIAS}>Todas as imobiliárias</SelectItem>
                                {imobiliarias?.map((imobiliaria) => (
                                    <SelectItem key={imobiliaria.id} value={String(imobiliaria.id)}>
                                        {imobiliaria.nomeFantasia ?? imobiliaria.razaoSocial}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={filtroStatus}
                            onValueChange={aplicarFiltro(setFiltroStatus)}
                            disabled={mostrarCarregando}
                        >
                            <SelectTrigger className="w-full md:w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={TODOS_STATUS}>Todos</SelectItem>
                                <SelectItem value="ABERTA">Aberta</SelectItem>
                                <SelectItem value="RESPONDIDA">Respondida</SelectItem>
                                <SelectItem value="EXPIRADA">Expirada</SelectItem>
                                <SelectItem value="PROCEDENTE">Procedente</SelectItem>
                                <SelectItem value="IMPROCEDENTE">Improcedente</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={() => setDialogAbrirAberto(true)}>
                            <Plus className="h-4 w-4" />
                            Abrir contestação
                        </Button>
                    </>
                }
            >
                {resultado?.contestacoes.map((contestacao) => (
                    <button
                        key={contestacao.id}
                        type="button"
                        onClick={() => setContestacaoSelecionadaId(contestacao.id)}
                        className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-medium">
                                {formatCpf(contestacao.ocorrencia.cpfInquilino)} ·{' '}
                                {contestacao.ocorrencia.nomeInquilinoInformado}
                            </span>
                            <ContestacaoStatusBadge status={contestacao.status} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatarTiposOcorrencia(contestacao.ocorrencia.tipos)} ·{' '}
                            {contestacao.imobiliaria.nomeFantasia ?? contestacao.imobiliaria.razaoSocial}
                        </p>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{contestacao.motivoConsumidor}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5" />
                                Prazo: {new Date(contestacao.prazoLimite).toLocaleDateString('pt-BR')}
                            </span>
                            <span>{contestacao._count.documentos} documento(s) enviado(s)</span>
                        </div>
                    </button>
                ))}
            </ListagemCard>

            <AbrirContestacaoDialog open={dialogAbrirAberto} onOpenChange={setDialogAbrirAberto} />

            <ContestacaoDetalheDialog
                contestacaoId={contestacaoSelecionadaId}
                onOpenChange={(open) => !open && setContestacaoSelecionadaId(null)}
                usuario={usuario}
            />
        </>
    )
}
