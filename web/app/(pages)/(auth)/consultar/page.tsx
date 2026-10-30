'use client'

import { useMutation } from '@tanstack/react-query'
import { Building2, FileSearch, Info, Loader2, Search, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CpfSearchCard } from '@/components/cpf-search-card'
import { RolagemComIndicadores } from '@/components/rolagem-com-indicadores'
import { OcorrenciaCard } from '@/components/ocorrencia-card'
import { formatCpf } from '@/lib/format-cpf'
import { cn } from '@/lib/utils'
import { getErrorMessage } from '@/lib/get-error-message'
import { useDelayedLoading } from '@/lib/use-delayed-loading'
import { ocorrenciaService, ConsultaResult, OcorrenciaDetalhe } from '@/app/services/ocorrencia.service'

export default function ConsultarPage() {
    const [resultado, setResultado] = useState<ConsultaResult | null>(null)
    const [cpfConsultado, setCpfConsultado] = useState('')
    const [detalhes, setDetalhes] = useState<OcorrenciaDetalhe[] | null>(null)

    const detalhesMutation = useMutation({
        mutationFn: (cpf: string) => ocorrenciaService.detalhar(cpf),
        onSuccess: (data) => setDetalhes(data),
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Não foi possível carregar os detalhes.'))
        }
    })

    const consultaMutation = useMutation({
        mutationFn: (cpf: string) => ocorrenciaService.consultar(cpf),
        onSuccess: (data, cpf) => {
            setResultado(data)
            setCpfConsultado(cpf)
            setDetalhes(null)
            if (data.constamInformacoes) {
                detalhesMutation.mutate(cpf)
            }
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Não foi possível consultar o CPF. Tente novamente.'))
        }
    })

    const mostrarCarregandoDetalhes = useDelayedLoading(detalhesMutation.isPending)

    function buscar(cpf: string) {
        if (cpf === cpfConsultado && resultado) return
        consultaMutation.mutate(cpf)
    }

    return (
        <div className="flex min-h-full flex-col gap-6 md:h-full md:min-h-0 lg:grid lg:grid-cols-[360px_1fr]">
            <div className="flex flex-col gap-4 lg:min-h-0">
                <CpfSearchCard
                    icon={Search}
                    title="Consultar Ocorrências"
                    description="Informe o CPF do inquilino"
                    isPending={consultaMutation.isPending}
                    onSubmit={buscar}
                />

                {resultado?.constamInformacoes && <ObservacaoConsulta className="hidden lg:mt-auto lg:flex" />}
            </div>

            {resultado ? (
                <Card className="flex flex-1 flex-col md:min-h-0 lg:overflow-hidden">
                    {!resultado.constamInformacoes && (
                        <CardContent className="flex flex-1 flex-col items-center justify-center gap-4 p-6 md:min-h-0">
                            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                                <ShieldCheck className="h-10 w-10 text-primary" />
                            </span>
                            <div className="flex flex-col items-center gap-1.5">
                                <p className="text-xl font-bold tracking-tight">Não constam informações</p>
                                <p className="text-sm text-muted-foreground">CPF {formatCpf(cpfConsultado)}</p>
                            </div>
                            <p className="max-w-xs text-center text-sm text-muted-foreground">
                                Nenhuma ocorrência foi registrada para esse CPF até o momento.
                            </p>
                        </CardContent>
                    )}

                    {resultado.constamInformacoes && (
                        <>
                            <CardHeader className="shrink-0 p-4 sm:p-6">
                                <CardTitle>CONSTAM INFORMAÇÕES</CardTitle>
                                <CardDescription>
                                    CPF {formatCpf(cpfConsultado)}
                                    {detalhes && ` · ${detalhes.length} ocorrência(s) registrada(s)`}
                                </CardDescription>
                            </CardHeader>
                            <RolagemComIndicadores
                                rotuloAbaixo="Há mais ocorrências abaixo"
                                className="flex flex-col px-3 pb-3 pt-0 sm:px-6 sm:pb-6 md:h-full md:min-h-0 md:overflow-y-auto"
                            >
                                {!detalhes && (
                                    <div className="flex flex-1 flex-col items-center justify-center gap-3 md:min-h-0">
                                        {mostrarCarregandoDetalhes && (
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        )}
                                        <p className="text-sm text-muted-foreground">Carregando detalhes...</p>
                                    </div>
                                )}

                                {detalhes && (
                                    <ul className="flex flex-col gap-3 sm:gap-4 md:pb-6">
                                        {detalhes.map((ocorrencia) => (
                                            <OcorrenciaCard
                                                key={ocorrencia.id}
                                                as="li"
                                                tipos={ocorrencia.tipos}
                                                dataOcorrencia={ocorrencia.dataOcorrencia}
                                                situacaoAtual={ocorrencia.situacaoAtual}
                                                faixaValor={ocorrencia.faixaValor}
                                                gravidade={ocorrencia.gravidade}
                                                mensagem={ocorrencia.mensagem}
                                            >
                                                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Building2 className="h-3.5 w-3.5" />
                                                    {ocorrencia.imobiliaria.nomeFantasia ?? ocorrencia.imobiliaria.razaoSocial}
                                                </p>
                                            </OcorrenciaCard>
                                        ))}
                                    </ul>
                                )}
                            </RolagemComIndicadores>
                        </>
                    )}
                </Card>
            ) : (
                <Card className="flex min-h-[280px] flex-1 flex-col items-center justify-center gap-3 border-dashed p-6">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                        <FileSearch className="h-7 w-7 text-muted-foreground" />
                    </span>
                    <p className="max-w-xs text-center text-sm text-muted-foreground">
                        Informe um CPF para consultar as ocorrências registradas
                    </p>
                </Card>
            )}

            {resultado?.constamInformacoes && <ObservacaoConsulta className="lg:hidden" />}
        </div>
    )
}

function ObservacaoConsulta({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'flex items-start gap-3 rounded-xl border border-border border-l-4 border-l-amber-400 bg-card px-4 py-3 shadow-lg shadow-black/10',
                className
            )}
        >
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
                As ocorrências exibidas foram registradas por imobiliárias participantes da plataforma. A
                responsabilidade pela veracidade das informações é exclusivamente da imobiliária registrante. A Safeloc
                atua apenas como provedora tecnológica e registra todas as operações realizadas no sistema.
            </p>
        </div>
    )
}
