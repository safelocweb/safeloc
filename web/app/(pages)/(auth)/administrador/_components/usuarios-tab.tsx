'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Users } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CpfInput } from '@/components/ui/cpf-input'
import { DateInput } from '@/components/ui/date-input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FloatingField } from '@/components/ui/floating-field'
import { Input } from '@/components/ui/input'
import { ListagemCard } from '@/components/ui/listagem-card'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { getErrorMessage } from '@/lib/get-error-message'
import { isCpfComplete } from '@/lib/format-cpf'
import { useDelayedLoading } from '@/lib/use-delayed-loading'
import { imobiliariaService } from '@/app/services/imobiliaria.service'
import { usuarioService, Usuario } from '@/app/services/usuario.service'

const criarSchema = z.object({
    imobiliariaId: z.string().min(1, 'Selecione a imobiliária'),
    nomeCompleto: z.string().min(1, 'Informe o nome completo'),
    cpf: z.string().refine(isCpfComplete, 'Informe um CPF válido'),
    dataNascimento: z
        .string()
        .min(1, 'Informe a data de nascimento')
        .refine((valor) => new Date(valor) <= new Date(), 'Data de nascimento não pode ser no futuro'),
    email: z.string().email('E-mail inválido'),
    login: z.string().min(1, 'Informe o login'),
    password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
    papel: z.enum(['ADMIN', 'PADRAO'], { required_error: 'Selecione o papel' })
})

const editarSchema = z.object({
    imobiliariaId: z.string().min(1, 'Selecione a imobiliária'),
    nomeCompleto: z.string().min(1, 'Informe o nome completo'),
    email: z.string().email('E-mail inválido'),
    status: z.enum(['ATIVO', 'INATIVO']),
    papel: z.enum(['ADMIN', 'PADRAO'], { required_error: 'Selecione o papel' }),
    password: z.string().optional()
})

type CriarFormValues = z.infer<typeof criarSchema>
type EditarFormValues = z.infer<typeof editarSchema>

const TODAS_IMOBILIARIAS = 'todas'

const PAPEL_LABEL: Record<'ADMIN' | 'PADRAO', string> = {
    ADMIN: 'Administrador',
    PADRAO: 'Padrão'
}

export function UsuariosTab() {
    const [dialogCriarAberto, setDialogCriarAberto] = useState(false)
    const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null)
    const [filtroImobiliaria, setFiltroImobiliaria] = useState<string>(TODAS_IMOBILIARIAS)
    const [formCriarKey, setFormCriarKey] = useState(0)
    const queryClient = useQueryClient()

    const { data: imobiliarias } = useQuery({
        queryKey: ['admin-imobiliarias'],
        queryFn: () => imobiliariaService.listar()
    })

    const imobiliariaIdFiltro =
        filtroImobiliaria === TODAS_IMOBILIARIAS ? undefined : Number(filtroImobiliaria)

    const { data: usuarios, isLoading, isFetching: isFetchingUsuarios } = useQuery({
        queryKey: ['admin-usuarios', imobiliariaIdFiltro],
        queryFn: () => usuarioService.listar(imobiliariaIdFiltro),
        placeholderData: keepPreviousData
    })

    const formCriar = useForm<CriarFormValues>({
        resolver: zodResolver(criarSchema),
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
        defaultValues: {
            imobiliariaId: '',
            nomeCompleto: '',
            cpf: '',
            dataNascimento: '',
            email: '',
            login: '',
            password: '',
            papel: 'ADMIN'
        }
    })

    const formEditar = useForm<EditarFormValues>({
        resolver: zodResolver(editarSchema),
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
        defaultValues: {
            imobiliariaId: '',
            nomeCompleto: '',
            email: '',
            status: 'ATIVO',
            papel: 'ADMIN',
            password: ''
        }
    })

    const criarMutation = useMutation({
        mutationFn: (values: CriarFormValues) =>
            usuarioService.criar({ ...values, imobiliariaId: Number(values.imobiliariaId) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] })
            queryClient.invalidateQueries({ queryKey: ['admin-imobiliarias'] })
            toast.success('Usuário criado com sucesso.')
            formCriar.reset()
            setFormCriarKey((atual) => atual + 1)
            setDialogCriarAberto(false)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Não foi possível criar o usuário. Verifique os dados e tente novamente.'))
        }
    })

    const atualizarMutation = useMutation({
        mutationFn: ({ id, imobiliariaId, password, ...resto }: EditarFormValues & { id: number }) =>
            usuarioService.atualizar(id, {
                ...resto,
                imobiliariaId: Number(imobiliariaId),
                password: password || undefined
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-usuarios'] })
            queryClient.invalidateQueries({ queryKey: ['admin-imobiliarias'] })
            toast.success('Usuário atualizado com sucesso.')
            setUsuarioEditando(null)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Não foi possível atualizar o usuário.'))
        }
    })

    const mostrarCarregandoCriar = useDelayedLoading(criarMutation.isPending)
    const mostrarCarregandoAtualizar = useDelayedLoading(atualizarMutation.isPending)
    const mostrarCarregandoFiltro = useDelayedLoading(isFetchingUsuarios)

    function iniciarEdicao(usuario: Usuario) {
        formEditar.reset({
            nomeCompleto: usuario.nomeCompleto,
            email: usuario.email,
            imobiliariaId: String(usuario.imobiliariaId ?? usuario.imobiliaria?.id ?? ''),
            status: usuario.status,
            papel: usuario.papel,
            password: ''
        })
        setUsuarioEditando(usuario)
    }

    return (
        <>
            <ListagemCard
                title="Usuários"
                description={`${usuarios?.length ?? 0} usuário(s)`}
                isLoading={isLoading}
                isEmpty={usuarios?.length === 0}
                emptyIcon={Users}
                emptyMessage="Nenhum usuário encontrado com esse filtro."
                headerActions={
                    <>
                        <div className="relative w-full md:w-56">
                            <SearchableSelect
                                value={filtroImobiliaria}
                                onValueChange={setFiltroImobiliaria}
                                disabled={mostrarCarregandoFiltro}
                                placeholder="Filtrar por imobiliária"
                                searchPlaceholder="Buscar imobiliária..."
                                options={[
                                    { value: TODAS_IMOBILIARIAS, label: 'Todas as imobiliárias' },
                                    ...(imobiliarias?.map((imobiliaria) => ({
                                        value: String(imobiliaria.id),
                                        label: imobiliaria.nomeFantasia ?? imobiliaria.razaoSocial
                                    })) ?? [])
                                ]}
                            />
                            {mostrarCarregandoFiltro && (
                                <Loader2 className="pointer-events-none absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                            )}
                        </div>
                        <Button onClick={() => setDialogCriarAberto(true)}>
                            <Plus className="h-4 w-4" />
                            Novo usuário
                        </Button>
                    </>
                }
            >
                {usuarios?.map((usuario) => (
                    <div
                        key={usuario.id}
                        className="flex flex-col gap-2 rounded-md border border-border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex min-w-0 items-start gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Users className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 font-medium">
                                    {usuario.nomeCompleto}
                                    <Badge variant={usuario.status === 'ATIVO' ? 'default' : 'outline'}>
                                        {usuario.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                    {usuario.role === 'MASTER' && <Badge variant="secondary">Master</Badge>}
                                    {usuario.role === 'IMOBILIARIA' && (
                                        <Badge variant="outline">{PAPEL_LABEL[usuario.papel]}</Badge>
                                    )}
                                </div>
                                <p className="break-words text-muted-foreground">
                                    {usuario.login} · {usuario.email}
                                    {usuario.imobiliaria &&
                                        ` · ${usuario.imobiliaria.nomeFantasia ?? usuario.imobiliaria.razaoSocial}`}
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-24"
                                onClick={() => iniciarEdicao(usuario)}
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
                        <DialogTitle>Novo usuário</DialogTitle>
                    </DialogHeader>
                    <form
                        className="flex flex-col gap-4"
                        noValidate
                        onSubmit={formCriar.handleSubmit((values) => criarMutation.mutate(values))}
                    >
                        <div className="flex flex-col gap-1.5">
                            <Controller
                                name="imobiliariaId"
                                control={formCriar.control}
                                render={({ field }) => (
                                    <SearchableSelect
                                        id="imobiliariaId"
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        placeholder="Selecione uma imobiliária"
                                        searchPlaceholder="Buscar imobiliária..."
                                        options={
                                            imobiliarias?.map((imobiliaria) => ({
                                                value: String(imobiliaria.id),
                                                label: imobiliaria.nomeFantasia ?? imobiliaria.razaoSocial
                                            })) ?? []
                                        }
                                    />
                                )}
                            />
                            {formCriar.formState.errors.imobiliariaId && (
                                <p className="text-xs text-destructive">
                                    {formCriar.formState.errors.imobiliariaId.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FloatingField
                                label="Nome completo"
                                htmlFor="nomeCompleto"
                                required
                                error={formCriar.formState.errors.nomeCompleto?.message}
                            >
                                <Input {...formCriar.register('nomeCompleto')} />
                            </FloatingField>
                            <FloatingField
                                label="CPF"
                                htmlFor="cpf"
                                required
                                error={formCriar.formState.errors.cpf?.message}
                            >
                                <CpfInput {...formCriar.register('cpf')} />
                            </FloatingField>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Controller
                                key={formCriarKey}
                                name="dataNascimento"
                                control={formCriar.control}
                                render={({ field }) => (
                                    <FloatingField
                                        label="Data de nascimento"
                                        htmlFor="dataNascimento"
                                        required
                                        error={formCriar.formState.errors.dataNascimento?.message}
                                    >
                                        <DateInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="DD/MM/AAAA"
                                        />
                                    </FloatingField>
                                )}
                            />
                            <FloatingField
                                label="E-mail"
                                htmlFor="email"
                                required
                                error={formCriar.formState.errors.email?.message}
                            >
                                <Input type="email" autoComplete="off" {...formCriar.register('email')} />
                            </FloatingField>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FloatingField
                                label="Usuário"
                                htmlFor="login"
                                required
                                error={formCriar.formState.errors.login?.message}
                            >
                                <Input autoComplete="off" {...formCriar.register('login')} />
                            </FloatingField>
                            <Controller
                                name="papel"
                                control={formCriar.control}
                                render={({ field }) => (
                                    <div className="mt-3 flex h-11 items-center justify-between gap-3 rounded-md border border-input px-3 sm:h-10">
                                        <span className="text-sm">
                                            {field.value === 'ADMIN' ? 'Administrador' : 'Padrão'}
                                        </span>
                                        <Switch
                                            checked={field.value === 'ADMIN'}
                                            onCheckedChange={(checked) => field.onChange(checked ? 'ADMIN' : 'PADRAO')}
                                            aria-label="Usuário é administrador"
                                        />
                                    </div>
                                )}
                            />
                        </div>

                        <FloatingField
                            label="Senha"
                            htmlFor="password"
                            required
                            error={formCriar.formState.errors.password?.message}
                        >
                            <Input type="password" autoComplete="new-password" {...formCriar.register('password')} />
                        </FloatingField>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={criarMutation.isPending}>
                                {mostrarCarregandoCriar && <Loader2 className="h-4 w-4 animate-spin" />}
                                {mostrarCarregandoCriar ? 'Salvando...' : 'Salvar usuário'}
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setDialogCriarAberto(false)}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={usuarioEditando !== null} onOpenChange={(open) => !open && setUsuarioEditando(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar usuário</DialogTitle>
                    </DialogHeader>
                    <form
                        className="flex flex-col gap-4"
                        noValidate
                        onSubmit={formEditar.handleSubmit((values) => {
                            if (usuarioEditando) {
                                atualizarMutation.mutate({ id: usuarioEditando.id, ...values })
                            }
                        })}
                    >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FloatingField
                                label="Nome completo"
                                htmlFor="nomeCompleto-editar"
                                error={formEditar.formState.errors.nomeCompleto?.message}
                            >
                                <Input {...formEditar.register('nomeCompleto')} />
                            </FloatingField>
                            <FloatingField
                                label="E-mail"
                                htmlFor="email-editar"
                                error={formEditar.formState.errors.email?.message}
                            >
                                <Input type="email" autoComplete="off" {...formEditar.register('email')} />
                            </FloatingField>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <Controller
                                    name="imobiliariaId"
                                    control={formEditar.control}
                                    render={({ field }) => (
                                        <SearchableSelect
                                            id="imobiliariaId-editar"
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            placeholder="Selecione uma imobiliária"
                                            searchPlaceholder="Buscar imobiliária..."
                                            options={
                                                imobiliarias?.map((imobiliaria) => ({
                                                    value: String(imobiliaria.id),
                                                    label: imobiliaria.nomeFantasia ?? imobiliaria.razaoSocial
                                                })) ?? []
                                            }
                                        />
                                    )}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Controller
                                    name="status"
                                    control={formEditar.control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger id="status-editar">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ATIVO">Ativo</SelectItem>
                                                <SelectItem value="INATIVO">Inativo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Controller
                                name="papel"
                                control={formEditar.control}
                                render={({ field }) => (
                                    <div className="mt-3 flex h-11 items-center justify-between gap-3 rounded-md border border-input px-3 sm:h-10">
                                        <span className="text-sm">
                                            {field.value === 'ADMIN' ? 'Administrador' : 'Padrão'}
                                        </span>
                                        <Switch
                                            checked={field.value === 'ADMIN'}
                                            onCheckedChange={(checked) => field.onChange(checked ? 'ADMIN' : 'PADRAO')}
                                            aria-label="Usuário é administrador"
                                        />
                                    </div>
                                )}
                            />
                            <FloatingField label="Nova senha (opcional)" htmlFor="password-editar">
                                <Input
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Deixe em branco pra manter"
                                    {...formEditar.register('password')}
                                />
                            </FloatingField>
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={atualizarMutation.isPending}>
                                {mostrarCarregandoAtualizar && <Loader2 className="h-4 w-4 animate-spin" />}
                                {mostrarCarregandoAtualizar ? 'Salvando...' : 'Salvar'}
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setUsuarioEditando(null)}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
