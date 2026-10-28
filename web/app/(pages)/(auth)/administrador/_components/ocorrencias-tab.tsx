'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Building2, FileSearch, User } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { OcorrenciaCard } from '@/components/ocorrencia-card'
import { CpfInput } from '@/components/ui/cpf-input'
import { ListagemCard } from '@/components/ui/listagem-card'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCpf, isCpfComplete } from '@/lib/format-cpf'
import { useDelayedLoading } from '@/lib/use-delayed-loading'
import { imobiliariaService } from '@/app/services/imobiliaria.service'
import { ocorrenciaService } from '@/app/services/ocorrencia.service'
import { TIPO_OCORRENCIA_OPTIONS, type TipoOcorrencia } from '@/shared/constants/tipo-ocorrencia'

const TODAS_IMOBILIARIAS = 'todas'
const TODOS_TIPOS = 'todos'
const TODOS_STATUS = 'todos'
const PAGE_SIZE = 20

export function OcorrenciasTab() {
    const [filtroImobiliaria, setFiltroImobiliaria] = useState(TODAS_IMOBILIARIAS)
    const [filtroTipo, setFiltroTipo] = useState(TODOS_TIPOS)
    const [filtroStatus, setFiltroStatus] = useState(TODOS_STATUS)
    const [filtroCpf, setFiltroCpf] = useState('')
    const [page, setPage] = useState(1)
    const [ultimaAcao, setUltimaAcao] = useState<'anterior' | 'proxima' | 'filtro' | null>(null)

    const { data: imobiliarias } = useQuery({
        queryKey: ['admin-imobiliarias'],
        queryFn: () => imobiliariaService.listar()
    })

    const cpfCompleto = isCpfComplete(filtroCpf) ? filtroCpf.replace(/\D/g, '') : undefined

    const { data: resultado, isLoading, isFetching } = useQuery({
        queryKey: ['admin-ocorrencias', filtroImobiliaria, filtroTipo, filtroStatus, cpfCompleto, page],
        queryFn: () =>
            ocorrenciaService.listarTodasAdmin({
                imobiliariaId: filtroImobiliaria === TODAS_IMOBILIARIAS ? undefined : Number(filtroImobiliaria),
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
            title="Ocorrências registradas"
            description={`${resultado?.total ?? 0} registro(s) no total`}
            isLoading={isLoading}
            isEmpty={resultado?.ocorrencias.length === 0}
            emptyIcon={FileSearch}
            emptyMessage="Nenhuma ocorrência encontrada com esses filtros."
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
                    <div className="w-full md:w-48">
                        <SearchableSelect
                            value={filtroImobiliaria}
                            onValueChange={aplicarFiltro(setFiltroImobiliaria)}
                            disabled={mostrarCarregando}
                            searchPlaceholder="Buscar imobiliária..."
                            options={[
                                { value: TODAS_IMOBILIARIAS, label: 'Todas as imobiliárias' },
                                ...(imobiliarias?.map((imobiliaria) => ({
                                    value: String(imobiliaria.id),
                                    label: imobiliaria.nomeFantasia ?? imobiliaria.razaoSocial
                                })) ?? [])
                            ]}
                        />
                    </div>
                    <Select
                        value={filtroTipo}
                        onValueChange={aplicarFiltro(setFiltroTipo)}
                        disabled={mostrarCarregando}
                    >
                        <SelectTrigger className="w-full md:w-44">
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
                    <Select
                        value={filtroStatus}
                        onValueChange={aplicarFiltro(setFiltroStatus)}
                        disabled={mostrarCarregando}
                    >
                        <SelectTrigger className="w-full md:w-36">
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
                    tipo={ocorrencia.tipo}
                    dataOcorrencia={ocorrencia.dataOcorrencia}
                    situacaoAtual={ocorrencia.situacaoAtual}
                    faixaValor={ocorrencia.faixaValor}
                    mensagem={ocorrencia.mensagem}
                    esmaecido={ocorrencia.status === 'EXCLUIDA'}
                    badgesExtras={ocorrencia.status === 'EXCLUIDA' && <Badge variant="outline">Excluída</Badge>}
                >
                    <p className="text-sm font-medium">
                        {formatCpf(ocorrencia.cpfInquilino)} · {ocorrencia.nomeInquilinoInformado}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" />
                            {ocorrencia.imobiliaria.nomeFantasia ?? ocorrencia.imobiliaria.razaoSocial}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            {ocorrencia.usuario.nomeCompleto} ({ocorrencia.usuario.login})
                        </span>
                    </div>
                </OcorrenciaCard>
            ))}
        </ListagemCard>
    )
}
