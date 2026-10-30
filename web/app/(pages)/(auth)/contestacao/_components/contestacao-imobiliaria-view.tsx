'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { MessageSquareWarning } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CpfInput } from '@/components/ui/cpf-input'
import { ListagemCard } from '@/components/ui/listagem-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCpf, isCpfComplete } from '@/lib/format-cpf'
import { useDelayedLoading } from '@/lib/use-delayed-loading'
import { useUser } from '@/app/providers/user-provider'
import { contestacaoService } from '@/app/services/contestacao.service'
import { ROUTES } from '@/shared/enums/routes.enum'
import { StatusContestacao } from '@/shared/constants/status-contestacao'
import { formatarTiposOcorrencia } from '@/shared/constants/tipo-ocorrencia'
import { ContestacaoDetalheDialog } from './contestacao-detalhe-dialog'
import { ContestacaoStatusBadge } from './contestacao-status-badge'

const TODOS_STATUS = 'todos'
const PAGE_SIZE = 20

export function ContestacaoImobiliariaView({ contestacaoIdParaAbrir }: { contestacaoIdParaAbrir: number | null }) {
    const { usuario } = useUser()
    const router = useRouter()
    const [filtroStatus, setFiltroStatus] = useState(TODOS_STATUS)
    const [filtroCpf, setFiltroCpf] = useState('')
    const [page, setPage] = useState(1)
    const [ultimaAcao, setUltimaAcao] = useState<'anterior' | 'proxima' | 'filtro' | null>(null)
    const [contestacaoSelecionadaId, setContestacaoSelecionadaId] = useState<number | null>(null)

    useEffect(() => {
        if (contestacaoIdParaAbrir !== null) {
            setContestacaoSelecionadaId(contestacaoIdParaAbrir)
            router.replace(ROUTES.CONTESTACAO)
        }
    }, [contestacaoIdParaAbrir, router])

    const cpfCompleto = isCpfComplete(filtroCpf) ? filtroCpf.replace(/\D/g, '') : undefined

    const { data: resultado, isLoading, isFetching } = useQuery({
        queryKey: ['contestacoes', filtroStatus, cpfCompleto, page],
        queryFn: () =>
            contestacaoService.listar({
                status: filtroStatus === TODOS_STATUS ? undefined : (filtroStatus as StatusContestacao),
                cpf: cpfCompleto,
                page,
                pageSize: PAGE_SIZE
            }),
        placeholderData: keepPreviousData
    })

    const mostrarCarregando = useDelayedLoading(isFetching)
    const totalPaginas = resultado ? Math.max(1, Math.ceil(resultado.total / PAGE_SIZE)) : 1

    if (!usuario) return null

    return (
        <>
            <ListagemCard
                title="Contestações Registradas"
                description={`${resultado?.total ?? 0} contestação(ões) contra a sua imobiliária`}
                isLoading={isLoading}
                isEmpty={resultado?.contestacoes.length === 0}
                emptyIcon={MessageSquareWarning}
                emptyMessage="Nenhuma contestação registrada até o momento."
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
                            value={filtroStatus}
                            onValueChange={(value) => {
                                setUltimaAcao('filtro')
                                setFiltroStatus(value)
                                setPage(1)
                            }}
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
                            {formatarTiposOcorrencia(contestacao.ocorrencia.tipos)}
                        </p>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{contestacao.motivoConsumidor}</p>
                        <p className="text-xs text-muted-foreground">
                            Prazo para envio de documentos: {new Date(contestacao.prazoLimite).toLocaleDateString('pt-BR')}
                        </p>
                    </button>
                ))}
            </ListagemCard>

            <ContestacaoDetalheDialog
                contestacaoId={contestacaoSelecionadaId}
                onOpenChange={(open) => !open && setContestacaoSelecionadaId(null)}
                usuario={usuario}
            />
        </>
    )
}
