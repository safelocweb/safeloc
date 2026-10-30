'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, FileText, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileInput } from '@/components/ui/file-input'
import { Textarea } from '@/components/ui/textarea'
import { formatCpf } from '@/lib/format-cpf'
import { getErrorMessage } from '@/lib/get-error-message'
import { useDelayedLoading } from '@/lib/use-delayed-loading'
import { UsuarioLogado } from '@/app/services/auth.service'
import { contestacaoService } from '@/app/services/contestacao.service'
import { formatarTiposOcorrencia } from '@/shared/constants/tipo-ocorrencia'
import { ContestacaoStatusBadge } from './contestacao-status-badge'

function formatarTamanho(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ContestacaoDetalheDialog({
    contestacaoId,
    onOpenChange,
    usuario
}: {
    contestacaoId: number | null
    onOpenChange: (open: boolean) => void
    usuario: UsuarioLogado
}) {
    const [decisaoPendente, setDecisaoPendente] = useState<'PROCEDENTE' | 'IMPROCEDENTE' | null>(null)
    const [observacao, setObservacao] = useState('')
    const [documentoBaixandoId, setDocumentoBaixandoId] = useState<number | null>(null)
    const queryClient = useQueryClient()

    const { data: contestacao, isLoading } = useQuery({
        queryKey: ['contestacao-detalhe', contestacaoId],
        queryFn: () => contestacaoService.detalhar(contestacaoId as number),
        enabled: contestacaoId !== null
    })

    const enviarDocumentoMutation = useMutation({
        mutationFn: (arquivo: File) => contestacaoService.enviarDocumento(contestacaoId as number, arquivo),
        onSuccess: () => {
            toast.success('Documento enviado com sucesso.')
            queryClient.invalidateQueries({ queryKey: ['contestacao-detalhe', contestacaoId] })
            queryClient.invalidateQueries({ queryKey: ['contestacoes'] })
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Não foi possível enviar o documento.'))
        }
    })

    const decidirMutation = useMutation({
        mutationFn: (input: { decisao: 'PROCEDENTE' | 'IMPROCEDENTE'; observacao?: string }) =>
            contestacaoService.decidir(contestacaoId as number, input),
        onSuccess: () => {
            toast.success('Decisão registrada com sucesso.')
            setDecisaoPendente(null)
            setObservacao('')
            queryClient.invalidateQueries({ queryKey: ['contestacao-detalhe', contestacaoId] })
            queryClient.invalidateQueries({ queryKey: ['contestacoes'] })
            onOpenChange(false)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Não foi possível registrar a decisão.'))
        }
    })

    async function baixarDocumento(documentoId: number, nomeArquivo: string) {
        setDocumentoBaixandoId(documentoId)
        try {
            await contestacaoService.baixarDocumento(contestacaoId as number, documentoId, nomeArquivo)
        } catch {
            toast.error('Não foi possível baixar o documento.')
        } finally {
            setDocumentoBaixandoId(null)
        }
    }

    const mostrarCarregandoEnvio = useDelayedLoading(enviarDocumentoMutation.isPending)

    const podeEnviarDocumento =
        contestacao && (contestacao.status === 'ABERTA' || contestacao.status === 'RESPONDIDA')

    const podeDecidir =
        usuario.role === 'MASTER' &&
        contestacao &&
        contestacao.status !== 'PROCEDENTE' &&
        contestacao.status !== 'IMPROCEDENTE'

    return (
        <>
            <Dialog open={contestacaoId !== null} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Contestação</DialogTitle>
                    </DialogHeader>

                    {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

                    {contestacao && (
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <ContestacaoStatusBadge status={contestacao.status} />
                                <span className="text-xs text-muted-foreground">
                                    Prazo para resposta: {new Date(contestacao.prazoLimite).toLocaleDateString('pt-BR')}
                                </span>
                            </div>

                            <div className="rounded-md border border-border p-3 text-sm">
                                <p className="font-medium">
                                    {formatCpf(contestacao.ocorrencia.cpfInquilino)} ·{' '}
                                    {contestacao.ocorrencia.nomeInquilinoInformado}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {formatarTiposOcorrencia(contestacao.ocorrencia.tipos)} ·{' '}
                                    {contestacao.imobiliaria.nomeFantasia ?? contestacao.imobiliaria.razaoSocial}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium">Motivo relatado pelo consumidor</p>
                                <p className="mt-1 text-sm text-muted-foreground">{contestacao.motivoConsumidor}</p>
                            </div>

                            {contestacao.decisaoObservacao && (
                                <div>
                                    <p className="text-sm font-medium">Observação da decisão</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {contestacao.decisaoObservacao}
                                    </p>
                                </div>
                            )}

                            <div>
                                <p className="text-sm font-medium">Documentos enviados</p>
                                {contestacao.documentos.length === 0 ? (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Nenhum documento enviado até o momento.
                                    </p>
                                ) : (
                                    <div className="mt-2 max-h-48 overflow-y-auto pr-1">
                                        <ul className="flex flex-col gap-2 pb-2">
                                            {contestacao.documentos.map((documento) => (
                                                <li
                                                    key={documento.id}
                                                    className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm"
                                                >
                                                    <span className="flex min-w-0 items-center gap-2">
                                                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                        <span className="flex min-w-0 flex-col">
                                                            <span className="truncate">{documento.nomeArquivo}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatarTamanho(documento.tamanhoBytes)} · enviado
                                                                por {documento.enviadoPorUsuario.nomeCompleto}
                                                            </span>
                                                        </span>
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={documentoBaixandoId === documento.id}
                                                        onClick={() =>
                                                            baixarDocumento(documento.id, documento.nomeArquivo)
                                                        }
                                                    >
                                                        {documentoBaixandoId === documento.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Download className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {podeEnviarDocumento && (
                                    <div className="mt-3">
                                        <FileInput
                                            label={
                                                usuario.role === 'MASTER'
                                                    ? 'Anexar documento do cliente'
                                                    : 'Enviar documento'
                                            }
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            disabled={enviarDocumentoMutation.isPending}
                                            loading={mostrarCarregandoEnvio}
                                            onFileSelected={(arquivo) => enviarDocumentoMutation.mutate(arquivo)}
                                        />
                                    </div>
                                )}
                            </div>

                            {podeDecidir && (
                                <div className="flex flex-col gap-2 border-t border-border pt-4">
                                    <p className="text-sm font-medium">Registrar decisão</p>
                                    <Textarea
                                        placeholder="Observação (opcional)"
                                        value={observacao}
                                        onChange={(event) => setObservacao(event.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => setDecisaoPendente('IMPROCEDENTE')}
                                        >
                                            Improcedente
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            className="flex-1"
                                            onClick={() => setDecisaoPendente('PROCEDENTE')}
                                        >
                                            Procedente
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={decisaoPendente !== null}
                onOpenChange={(open) => !open && setDecisaoPendente(null)}
                title={
                    decisaoPendente === 'PROCEDENTE'
                        ? 'Marcar contestação como procedente?'
                        : 'Marcar contestação como improcedente?'
                }
                description={
                    decisaoPendente === 'PROCEDENTE'
                        ? 'O consumidor tinha razão, mas isso não exclui a ocorrência automaticamente.'
                        : 'A imobiliária comprovou a veracidade do registro. A ocorrência permanece válida.'
                }
                confirmLabel="Confirmar"
                cancelLabel="Cancelar"
                loading={decidirMutation.isPending}
                onConfirm={() => {
                    if (decisaoPendente) {
                        decidirMutation.mutate({ decisao: decisaoPendente, observacao: observacao || undefined })
                    }
                }}
            />
        </>
    )
}
