'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CpfInput } from '@/components/ui/cpf-input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { formatCpf, isCpfComplete } from '@/lib/format-cpf'
import { getErrorMessage } from '@/lib/get-error-message'
import { useDelayedLoading } from '@/lib/use-delayed-loading'
import { ocorrenciaService } from '@/app/services/ocorrencia.service'
import { contestacaoService } from '@/app/services/contestacao.service'
import { formatarTiposOcorrencia } from '@/shared/constants/tipo-ocorrencia'
import { cn } from '@/lib/utils'

export function AbrirContestacaoDialog({
    open,
    onOpenChange
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const [cpf, setCpf] = useState('')
    const [ocorrenciaId, setOcorrenciaId] = useState<number | null>(null)
    const [motivoConsumidor, setMotivoConsumidor] = useState('')
    const queryClient = useQueryClient()

    const cpfCompleto = isCpfComplete(cpf) ? cpf.replace(/\D/g, '') : undefined

    const { data: resultado, isFetching } = useQuery({
        queryKey: ['contestacao-busca-ocorrencia', cpfCompleto],
        queryFn: () =>
            ocorrenciaService.listarTodasAdmin({ cpf: cpfCompleto, status: 'ATIVA', page: 1, pageSize: 20 }),
        enabled: cpfCompleto !== undefined
    })

    const abrirMutation = useMutation({
        mutationFn: () => contestacaoService.abrir({ ocorrenciaId: ocorrenciaId as number, motivoConsumidor }),
        onSuccess: () => {
            toast.success('Contestação aberta com sucesso.')
            queryClient.invalidateQueries({ queryKey: ['contestacoes'] })
            fecharEResetar()
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Não foi possível abrir a contestação.'))
        }
    })

    const mostrarCarregando = useDelayedLoading(abrirMutation.isPending)

    function fecharEResetar() {
        onOpenChange(false)
        setCpf('')
        setOcorrenciaId(null)
        setMotivoConsumidor('')
    }

    return (
        <Dialog open={open} onOpenChange={(value) => !value && fecharEResetar()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Abrir contestação</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium" htmlFor="cpf-busca-contestacao">
                            CPF do inquilino
                        </label>
                        <CpfInput
                            id="cpf-busca-contestacao"
                            value={cpf}
                            onChange={(event) => {
                                setCpf(event.target.value)
                                setOcorrenciaId(null)
                            }}
                        />
                    </div>

                    {isFetching && <p className="text-sm text-muted-foreground">Buscando...</p>}

                    {resultado && resultado.ocorrencias.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            Nenhuma ocorrência ativa encontrada para esse CPF.
                        </p>
                    )}

                    {resultado && resultado.ocorrencias.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium">Selecione a ocorrência contestada</p>
                            <div className="max-h-48 overflow-y-auto">
                                <div className="flex flex-col gap-2 pb-2">
                                    {resultado.ocorrencias.map((ocorrencia) => (
                                        <button
                                            key={ocorrencia.id}
                                            type="button"
                                            onClick={() => setOcorrenciaId(ocorrencia.id)}
                                            className={cn(
                                                'flex flex-col items-start rounded-md border p-3 text-left text-sm transition-colors',
                                                ocorrenciaId === ocorrencia.id
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:bg-accent'
                                            )}
                                        >
                                            <span className="font-medium">
                                                {formatarTiposOcorrencia(ocorrencia.tipos)} ·{' '}
                                                {formatCpf(ocorrencia.cpfInquilino)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {ocorrencia.imobiliaria.nomeFantasia ??
                                                    ocorrencia.imobiliaria.razaoSocial}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium" htmlFor="motivo-contestacao">
                            Motivo relatado pelo consumidor
                        </label>
                        <Textarea
                            id="motivo-contestacao"
                            value={motivoConsumidor}
                            onChange={(event) => setMotivoConsumidor(event.target.value)}
                            placeholder="Descreva o que o consumidor relatou..."
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            disabled={!ocorrenciaId || !motivoConsumidor.trim() || abrirMutation.isPending}
                            onClick={() => abrirMutation.mutate()}
                        >
                            {mostrarCarregando && <Loader2 className="h-4 w-4 animate-spin" />}
                            {mostrarCarregando ? 'Abrindo...' : 'Abrir contestação'}
                        </Button>
                        <Button type="button" variant="ghost" onClick={fecharEResetar}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
