'use client'

import { useMutation } from '@tanstack/react-query'
import { Clock, FolderOpen, Inbox, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { RequirePapelAdmin } from '@/components/require-papel-admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CpfSearchCard } from '@/components/cpf-search-card'
import { getErrorMessage } from '@/lib/get-error-message'
import { useDelayedLoading } from '@/lib/use-delayed-loading'
import { ocorrenciaService, OcorrenciaExcluivel } from '@/app/services/ocorrencia.service'
import {
    TIPO_OCORRENCIA_ICON,
    TIPO_OCORRENCIA_ICON_PADRAO,
    TIPO_OCORRENCIA_LABEL
} from '@/shared/constants/tipo-ocorrencia'
import { SITUACAO_OCORRENCIA_LABEL } from '@/shared/constants/situacao-ocorrencia'
import { FAIXA_VALOR_OCORRENCIA_LABEL } from '@/shared/constants/faixa-valor-ocorrencia'
import { GRAVIDADE_OCORRENCIA_BADGE_CLASS, GRAVIDADE_OCORRENCIA_LABEL } from '@/shared/constants/gravidade-ocorrencia'

function ExcluirPage() {
    const [registros, setRegistros] = useState<OcorrenciaExcluivel[] | null>(null)
    const [cpfConsultado, setCpfConsultado] = useState('')
    const [registroParaExcluir, setRegistroParaExcluir] = useState<OcorrenciaExcluivel | null>(null)

    const listarMutation = useMutation({
        mutationFn: (cpf: string) => ocorrenciaService.listarExcluiveis(cpf),
        onSuccess: (data, cpf) => {
            setRegistros(data)
            setCpfConsultado(cpf)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Não foi possível consultar o CPF. Tente novamente.'))
        }
    })

    const excluirMutation = useMutation({
        mutationFn: (id: number) => ocorrenciaService.excluir(id),
        onSuccess: (_data, id) => {
            setRegistros((atual) => atual?.filter((registro) => registro.id !== id) ?? null)
            setRegistroParaExcluir(null)
            toast.success('Registro excluído com sucesso.')
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Não foi possível excluir o registro.'))
        }
    })

    const mostrarCarregandoExclusao = useDelayedLoading(excluirMutation.isPending)

    function buscar(cpf: string) {
        if (cpf === cpfConsultado && registros) return
        listarMutation.mutate(cpf)
    }

    return (
        <div className="flex min-h-full flex-col gap-6 md:h-full md:min-h-0 lg:grid lg:grid-cols-[360px_1fr]">
            <div className="lg:self-start">
                <CpfSearchCard
                    icon={Trash2}
                    title="Excluir informações"
                    description="Informe o CPF do inquilino"
                    isPending={listarMutation.isPending}
                    onSubmit={buscar}
                />
            </div>

            {registros ? (
                <Card className="flex flex-1 flex-col md:min-h-0 lg:overflow-hidden">
                    <CardHeader className="shrink-0">
                        <CardTitle>
                            {registros.length === 0
                                ? 'Nenhum registro administrável por sua imobiliária'
                                : 'Registros da sua imobiliária'}
                        </CardTitle>
                        {registros.length > 0 && (
                            <CardDescription>{registros.length} registro(s) encontrado(s)</CardDescription>
                        )}
                    </CardHeader>
                    {registros.length === 0 && (
                        <CardContent className="flex flex-1 flex-col items-center justify-center gap-3 md:min-h-0">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                <Inbox className="h-7 w-7 text-muted-foreground" />
                            </span>
                            <p className="max-w-xs text-center text-sm text-muted-foreground">
                                Nenhuma ocorrência registrada por sua imobiliária foi encontrada para esse CPF.
                            </p>
                        </CardContent>
                    )}

                    {registros.length > 0 && (
                        <div className="flex-1 md:min-h-0">
                            <CardContent className="flex flex-col md:h-full md:min-h-0 md:overflow-y-auto">
                                <ul className="flex flex-col gap-4 pb-6">
                                {registros.map((registro) => {
                                    const Icon = TIPO_OCORRENCIA_ICON[registro.tipo] ?? TIPO_OCORRENCIA_ICON_PADRAO
                                    return (
                                        <li
                                            key={registro.id}
                                            className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                                        >
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                                        <Icon className="h-4 w-4" />
                                                    </span>
                                                    <Badge variant="secondary">
                                                        {TIPO_OCORRENCIA_LABEL[registro.tipo] ?? registro.tipo}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(registro.dataOcorrencia).toLocaleDateString('pt-BR')}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 shrink-0 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => setRegistroParaExcluir(registro)}
                                                        aria-label="Excluir registro"
                                                        title="Excluir registro"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="pl-11">
                                                <div className="mt-2 flex flex-wrap gap-1.5">
                                                    <Badge className={GRAVIDADE_OCORRENCIA_BADGE_CLASS[registro.gravidade]}>
                                                        {GRAVIDADE_OCORRENCIA_LABEL[registro.gravidade]}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {SITUACAO_OCORRENCIA_LABEL[registro.situacaoAtual]}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {FAIXA_VALOR_OCORRENCIA_LABEL[registro.faixaValor]}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })}
                                </ul>
                            </CardContent>
                        </div>
                    )}
                </Card>
            ) : (
                <Card className="flex min-h-[280px] flex-1 flex-col items-center justify-center gap-3 border-dashed p-6">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                        <FolderOpen className="h-7 w-7 text-muted-foreground" />
                    </span>
                    <p className="max-w-xs text-center text-sm text-muted-foreground">
                        Informe um CPF para ver os registros administráveis pela sua imobiliária
                    </p>
                </Card>
            )}

            <ConfirmDialog
                open={registroParaExcluir !== null}
                onOpenChange={(open) => !open && setRegistroParaExcluir(null)}
                title="Excluir este registro?"
                description={
                    registroParaExcluir
                        ? `A ocorrência de "${TIPO_OCORRENCIA_LABEL[registroParaExcluir.tipo] ?? registroParaExcluir.tipo}" será excluída. Essa ação não pode ser desfeita.`
                        : undefined
                }
                confirmLabel="Sim, excluir"
                cancelLabel="Não"
                loading={mostrarCarregandoExclusao}
                onConfirm={() => {
                    if (registroParaExcluir) {
                        excluirMutation.mutate(registroParaExcluir.id)
                    }
                }}
            />
        </div>
    )
}

export default function ExcluirPageGuard() {
    return (
        <RequirePapelAdmin>
            <ExcluirPage />
        </RequirePapelAdmin>
    )
}
