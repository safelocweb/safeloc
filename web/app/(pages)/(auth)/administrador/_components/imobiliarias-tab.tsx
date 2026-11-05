'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Loader2, Plus, Search, Users } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CnpjInput } from '@/components/ui/cnpj-input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FloatingField } from '@/components/ui/floating-field'
import { Input } from '@/components/ui/input'
import { ListagemCard } from '@/components/ui/listagem-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCnpj, isCnpjComplete } from '@/lib/format-cnpj'
import { getErrorMessage } from '@/lib/get-error-message'
import { useDelayedLoading } from '@/lib/use-delayed-loading'
import {
    imobiliariaService,
    ImobiliariaComContagem
} from '@/app/services/imobiliaria.service'
import { usuarioService } from '@/app/services/usuario.service'

const PAPEL_LABEL: Record<'ADMIN' | 'PADRAO', string> = {
    ADMIN: 'Administrador',
    PADRAO: 'Padrão'
}

const criarSchema = z.object({
    razaoSocial: z.string().min(1, 'Informe a razão social'),
    nomeFantasia: z.string().optional(),
    cnpj: z.string().refine(isCnpjComplete, 'Informe um CNPJ válido'),
    email: z.string().email('E-mail inválido')
})

const editarSchema = z.object({
    razaoSocial: z.string().min(1, 'Informe a razão social'),
    nomeFantasia: z.string().optional(),
    email: z.string().email('E-mail inválido'),
    status: z.enum(['ATIVO', 'INATIVO'])
})

type CriarFormValues = z.infer<typeof criarSchema>
type EditarFormValues = z.infer<typeof editarSchema>

export function ImobiliariasTab() {
    const [dialogCriarAberto, setDialogCriarAberto] = useState(false)
    const [imobiliariaEditando, setImobiliariaEditando] = useState<ImobiliariaComContagem | null>(null)
    const [busca, setBusca] = useState('')
    const queryClient = useQueryClient()

    const { data: imobiliarias, isLoading } = useQuery({
        queryKey: ['admin-imobiliarias'],
        queryFn: () => imobiliariaService.listar()
    })

    const imobiliariasFiltradas = useMemo(() => {
        const termo = busca.trim().toLowerCase()
        if (!termo) return imobiliarias
        return imobiliarias?.filter((imobiliaria) => {
            const nome = (imobiliaria.nomeFantasia ?? imobiliaria.razaoSocial).toLowerCase()
            const razaoSocial = imobiliaria.razaoSocial.toLowerCase()
            const cnpj = imobiliaria.cnpj.replace(/\D/g, '')
            return (
                nome.includes(termo) ||
                razaoSocial.includes(termo) ||
                cnpj.includes(termo.replace(/\D/g, ''))
            )
        })
    }, [imobiliarias, busca])

    const { data: usuariosVinculados, isLoading: carregandoUsuariosVinculados } = useQuery({
        queryKey: ['admin-usuarios', imobiliariaEditando?.id],
        queryFn: () => usuarioService.listar(imobiliariaEditando!.id),
        enabled: imobiliariaEditando !== null
    })

    const formCriar = useForm<CriarFormValues>({
        resolver: zodResolver(criarSchema),
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
        defaultValues: { razaoSocial: '', nomeFantasia: '', cnpj: '', email: '' }
    })

    const formEditar = useForm<EditarFormValues>({
        resolver: zodResolver(editarSchema),
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
        defaultValues: { razaoSocial: '', nomeFantasia: '', email: '' }
    })

    const criarMutation = useMutation({
        mutationFn: (values: CriarFormValues) => imobiliariaService.criar(values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-imobiliarias'] })
            toast.success('Imobiliária criada com sucesso.')
            formCriar.reset()
            setDialogCriarAberto(false)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Não foi possível criar a imobiliária. Verifique os dados e tente novamente.'))
        }
    })

    const atualizarMutation = useMutation({
        mutationFn: ({
            id,
            input
        }: {
            id: number
            input: { razaoSocial?: string; nomeFantasia?: string; email?: string; status?: 'ATIVO' | 'INATIVO' }
        }) => imobiliariaService.atualizar(id, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-imobiliarias'] })
            toast.success('Imobiliária atualizada com sucesso.')
            setImobiliariaEditando(null)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Não foi possível atualizar a imobiliária.'))
        }
    })

    const mostrarCarregandoCriar = useDelayedLoading(criarMutation.isPending)
    const mostrarCarregandoAtualizar = useDelayedLoading(atualizarMutation.isPending)

    function iniciarEdicao(imobiliaria: ImobiliariaComContagem) {
        formEditar.reset({
            razaoSocial: imobiliaria.razaoSocial,
            nomeFantasia: imobiliaria.nomeFantasia ?? '',
            email: imobiliaria.email,
            status: imobiliaria.status
        })
        setImobiliariaEditando(imobiliaria)
    }

    return (
        <>
            <ListagemCard
                title="Imobiliárias cadastradas"
                description={`${imobiliariasFiltradas?.length ?? 0} imobiliária(s)`}
                isLoading={isLoading}
                isEmpty={imobiliariasFiltradas?.length === 0}
                emptyIcon={Building2}
                emptyMessage="Nenhuma imobiliária encontrada com essa busca."
                headerActions={
                    <>
                        <div className="relative col-span-2 w-full md:w-64">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={busca}
                                onChange={(event) => setBusca(event.target.value)}
                                placeholder="Buscar por nome ou CNPJ"
                                className="pl-9"
                            />
                        </div>
                        <Button className="col-span-2" onClick={() => setDialogCriarAberto(true)}>
                            <Plus className="h-4 w-4" />
                            Nova imobiliária
                        </Button>
                    </>
                }
            >
                {imobiliariasFiltradas?.map((imobiliaria) => (
                    <div
                        key={imobiliaria.id}
                        className="flex flex-col gap-2 rounded-md border border-border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex items-start gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Building2 className="h-4 w-4" />
                            </span>
                            <div>
                                <div className="flex items-center gap-2 font-medium">
                                    {imobiliaria.nomeFantasia ?? imobiliaria.razaoSocial}
                                    <Badge variant={imobiliaria.status === 'ATIVO' ? 'default' : 'outline'}>
                                        {imobiliaria.status === 'ATIVO' ? 'Ativa' : 'Inativa'}
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground">
                                    {formatCnpj(imobiliaria.cnpj)} · {imobiliaria.email} ·{' '}
                                    {imobiliaria._count.usuarios === 0
                                        ? 'nenhum usuário'
                                        : `${imobiliaria._count.usuarios} usuário(s)`}
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-24"
                                onClick={() => iniciarEdicao(imobiliaria)}
                            >
                                Editar
                            </Button>
                        </div>
                    </div>
                ))}
            </ListagemCard>

            <Dialog open={dialogCriarAberto} onOpenChange={setDialogCriarAberto}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nova imobiliária</DialogTitle>
                    </DialogHeader>
                    <form
                        className="flex flex-col gap-4"
                        noValidate
                        onSubmit={formCriar.handleSubmit((values) => criarMutation.mutate(values))}
                    >
                        <FloatingField
                            label="Razão social"
                            htmlFor="razaoSocial"
                            required
                            error={formCriar.formState.errors.razaoSocial?.message}
                        >
                            <Input {...formCriar.register('razaoSocial')} />
                        </FloatingField>
                        <FloatingField label="Nome fantasia" htmlFor="nomeFantasia">
                            <Input {...formCriar.register('nomeFantasia')} />
                        </FloatingField>
                        <FloatingField
                            label="CNPJ"
                            htmlFor="cnpj"
                            required
                            error={formCriar.formState.errors.cnpj?.message}
                        >
                            <CnpjInput {...formCriar.register('cnpj')} />
                        </FloatingField>
                        <FloatingField
                            label="E-mail"
                            htmlFor="email"
                            required
                            error={formCriar.formState.errors.email?.message}
                        >
                            <Input type="email" autoComplete="off" {...formCriar.register('email')} />
                        </FloatingField>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={criarMutation.isPending}>
                                {mostrarCarregandoCriar && <Loader2 className="h-4 w-4 animate-spin" />}
                                {mostrarCarregandoCriar ? 'Salvando...' : 'Salvar imobiliária'}
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setDialogCriarAberto(false)}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={imobiliariaEditando !== null}
                onOpenChange={(open) => !open && setImobiliariaEditando(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar imobiliária</DialogTitle>
                    </DialogHeader>
                    <form
                        className="flex flex-col gap-4"
                        noValidate
                        onSubmit={formEditar.handleSubmit((values) => {
                            if (imobiliariaEditando) {
                                atualizarMutation.mutate({ id: imobiliariaEditando.id, input: values })
                            }
                        })}
                    >
                        <FloatingField
                            label="Razão social"
                            htmlFor="razaoSocial-editar"
                            required
                            error={formEditar.formState.errors.razaoSocial?.message}
                        >
                            <Input {...formEditar.register('razaoSocial')} />
                        </FloatingField>
                        <FloatingField label="Nome fantasia" htmlFor="nomeFantasia-editar">
                            <Input {...formEditar.register('nomeFantasia')} />
                        </FloatingField>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FloatingField
                                label="E-mail"
                                htmlFor="email-editar"
                                required
                                error={formEditar.formState.errors.email?.message}
                            >
                                <Input type="email" autoComplete="off" {...formEditar.register('email')} />
                            </FloatingField>
                            <Controller
                                name="status"
                                control={formEditar.control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger id="status-editar" className="mt-3 sm:h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ATIVO">Ativa</SelectItem>
                                            <SelectItem value="INATIVO">Inativa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Usuários vinculados
                            </p>
                            {carregandoUsuariosVinculados && (
                                <p className="text-sm text-muted-foreground">Carregando...</p>
                            )}
                            {!carregandoUsuariosVinculados && usuariosVinculados?.length === 0 && (
                                <p className="text-sm text-muted-foreground">Nenhum usuário vinculado.</p>
                            )}
                            {usuariosVinculados && usuariosVinculados.length > 0 && (
                                <div className="flex max-h-20 flex-col gap-2 overflow-y-auto rounded-md border border-border p-2">
                                    {usuariosVinculados.map((usuario) => (
                                        <div
                                            key={usuario.id}
                                            className="flex h-9 shrink-0 items-center gap-2 rounded-sm px-1.5 text-sm"
                                        >
                                            <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                            <span className="min-w-0 flex-1 truncate">{usuario.nomeCompleto}</span>
                                            <Badge variant={usuario.status === 'ATIVO' ? 'default' : 'outline'}>
                                                {usuario.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                            {usuario.role === 'MASTER' ? (
                                                <Badge variant="secondary">Master</Badge>
                                            ) : (
                                                <Badge variant="outline">{PAPEL_LABEL[usuario.papel]}</Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={atualizarMutation.isPending}>
                                {mostrarCarregandoAtualizar && <Loader2 className="h-4 w-4 animate-spin" />}
                                {mostrarCarregandoAtualizar ? 'Salvando...' : 'Salvar'}
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setImobiliariaEditando(null)}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
