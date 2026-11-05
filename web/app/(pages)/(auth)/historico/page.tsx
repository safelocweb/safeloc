'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { CalendarPlus, History, Trash2, User } from 'lucide-react'
import { useState } from 'react'
import { OcorrenciaCard } from '@/components/ocorrencia-card'
import { RequirePapelAdmin } from '@/components/require-papel-admin'
import { Badge } from '@/components/ui/badge'
import { CpfInput } from '@/components/ui/cpf-input'
import { ListagemCard } from '@/components/ui/listagem-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCpf, isCpfComplete } from '@/lib/format-cpf'
import { useDelayedLoading } from '@/lib/use-delayed-loading'
import { ocorrenciaService } from '@/app/services/ocorrencia.service'
import { TIPO_OCORRENCIA_OPTIONS, type TipoOcorrencia } from '@/shared/constants/tipo-ocorrencia'

const TODOS_TIPOS = 'todos'
const TODOS_STATUS = 'todos'
const PAGE_SIZE = 20

function formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR')
}

function HistoricoPage() {
    const [filtroCpf, setFiltroCpf] = useState('')
    const [filtroTipo, setFiltroTipo] = useState(TODOS_TIPOS)
    const [filtroStatus, setFiltroStatus] = useState(TODOS_STATUS)
    const [page, setPage] = useState(1)
    const [ultimaAcao, setUltimaAcao] = useState<'anterior' | 'proxima' | 'filtro' | null>(null)

    const cpfCompleto = isCpfComplete(filtroCpf) ? filtroCpf.replace(/\D/g, '') : undefined

    const { data: resultado, isLoading, isFetching, isError } = useQuery({
        queryKey: ['historico-ocorrencias', filtroTipo, filtroStatus, cpfCompleto, page],
        queryFn: () =>
            ocorrenciaService.listarHistorico({
                tipo: filtroTipo === TODOS_TIPOS ? undefined : (filtroTipo as TipoOcorrencia),
                status: filtroStatus === TODOS_STATUS ? undefined : (filtroStatus as 'ATIVA' | 'EXCLUIDA'),
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

    return (
        <ListagemCard
            title="Histórico de Ocorrências"
            description={`${resultado?.total ?? 0} registro(s) da sua imobiliária`}
            isLoading={isLoading}
            isEmpty={isError || resultado?.ocorrencias.length === 0}
            emptyIcon={History}
            emptyMessage={
                isError
                    ? 'Não foi possível carregar o histórico. Tente novamente.'
                    : 'Nenhuma ocorrência encontrada com esses filtros.'
            }
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
                    <div className="col-span-2 w-full md:w-44">
                        <CpfInput
                            value={filtroCpf}
                            onChange={(event) => aplicarFiltro(setFiltroCpf)(event.target.value)}
                            placeholder="Buscar por CPF"
                        />
                    </div>
                    <Select value={filtroTipo} onValueChange={aplicarFiltro(setFiltroTipo)}>
                        <SelectTrigger className="w-full md:w-52" aria-label="Filtrar por tipo">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={TODOS_TIPOS}>Todos os tipos</SelectItem>
                            {TIPO_OCORRENCIA_OPTIONS.map((tipo) => (
                                <SelectItem key={tipo.value} value={tipo.value}>
                                    {tipo.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filtroStatus} onValueChange={aplicarFiltro(setFiltroStatus)}>
                        <SelectTrigger className="w-full md:w-36" aria-label="Filtrar por status">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={TODOS_STATUS}>Todos</SelectItem>
                            <SelectItem value="ATIVA">Ativas</SelectItem>
                            <SelectItem value="EXCLUIDA">Excluídas</SelectItem>
                        </SelectContent>
                    </Select>
                </>
            }
        >
            {resultado?.ocorrencias.map((ocorrencia) => (
                <OcorrenciaCard
                    key={ocorrencia.id}
                    tipos={ocorrencia.tipos}
                    dataOcorrencia={ocorrencia.dataOcorrencia}
                    situacaoAtual={ocorrencia.situacaoAtual}
                    faixaValor={ocorrencia.faixaValor}
                    gravidade={ocorrencia.gravidade}
                    mensagem={ocorrencia.mensagem}
                    esmaecido={ocorrencia.status === 'EXCLUIDA'}
                    badgesExtras={ocorrencia.status === 'EXCLUIDA' && <Badge variant="outline">Excluída</Badge>}
                >
                    <p className="break-words text-sm font-medium">
                        {formatCpf(ocorrencia.cpfInquilino)} · {ocorrencia.nomeInquilinoInformado}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex min-w-0 items-center gap-1.5">
                            <User className="h-3.5 w-3.5 shrink-0" />
                            <span className="min-w-0 break-words">{ocorrencia.usuario.nomeCompleto}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CalendarPlus className="h-3.5 w-3.5 shrink-0" />
                            Registrada em {formatarData(ocorrencia.createdAt)}
                        </span>
                        {ocorrencia.excluidoEm && (
                            <span className="flex items-center gap-1.5">
                                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                                Excluída em {formatarData(ocorrencia.excluidoEm)}
                            </span>
                        )}
                    </div>
                </OcorrenciaCard>
            ))}
        </ListagemCard>
    )
}

export default function Page() {
    return (
        <RequirePapelAdmin>
            <HistoricoPage />
        </RequirePapelAdmin>
    )
}
