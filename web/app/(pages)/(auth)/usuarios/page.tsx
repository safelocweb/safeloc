'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Users } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { RequirePapelAdmin } from '@/components/require-papel-admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CpfInput } from '@/components/ui/cpf-input'
import { DateInput } from '@/components/ui/date-input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FloatingField } from '@/components/ui/floating-field'
import { Input } from '@/components/ui/input'
import { ListagemCard } from '@/components/ui/listagem-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { getErrorMessage } from '@/lib/get-error-message'
import { isCpfComplete } from '@/lib/format-cpf'
import { useDelayedLoading } from '@/lib/use-delayed-loading'
import { imobiliariaService } from '@/app/services/imobiliaria.service'
import { usuarioService, Usuario } from '@/app/services/usuario.service'

const usuarioSchema = z.object({
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

const PAPEL_LABEL: Record<'ADMIN' | 'PADRAO', string> = {
    ADMIN: 'Administrador',
    PADRAO: 'Padrão'
}

type UsuarioFormValues = z.infer<typeof usuarioSchema>

function UsuariosPage() {
    const [dialogAberto, setDialogAberto] = useState(false)
    const [formKey, setFormKey] = useState(0)
    const [usuarioParaDesativar, setUsuarioParaDesativar] = useState<Usuario | null>(null)
    const queryClient = useQueryClient()

    const { data: usuarios, isLoading } = useQuery({
        queryKey: ['usuarios'],
        queryFn: () => usuarioService.listar()
    })

    const { data: imobiliariaAtual } = useQuery({
        queryKey: ['imobiliaria-me'],
        queryFn: () => imobiliariaService.me(),
        enabled: dialogAberto
    })

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<UsuarioFormValues>({
        resolver: zodResolver(usuarioSchema),
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
        defaultValues: {
            nomeCompleto: '',
            cpf: '',
            dataNascimento: '',
            email: '',
            login: '',
            password: '',
            papel: 'ADMIN'
        }
    })

    const criarMutation = useMutation({
        mutationFn: (values: UsuarioFormValues) => usuarioService.criar(values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['usuarios'] })
            toast.success('Usuário criado com sucesso.')
            reset()
            setFormKey((atual) => atual + 1)
            setDialogAberto(false)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Não foi possível criar o usuário. Verifique os dados e tente novamente.'))
        }
    })

    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: 'ATIVO' | 'INATIVO' }) =>
            usuarioService.atualizarStatus(id, status),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['usuarios'] })
            toast.success(variables.status === 'ATIVO' ? 'Usuário reativado.' : 'Usuário desativado.')
            setUsuarioParaDesativar(null)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Não foi possível atualizar o usuário.'))
        }
    })

    const papelMutation = useMutation({
        mutationFn: ({ id, papel }: { id: number; papel: 'ADMIN' | 'PADRAO' }) =>
            usuarioService.atualizar(id, { papel }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['usuarios'] })
            toast.success('Papel do usuário atualizado.')
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Não foi possível atualizar o papel do usuário.'))
        }
    })

    const usuariosAtivos = usuarios?.filter((usuario) => usuario.status === 'ATIVO').length ?? 0
    const mostrarCarregandoCriar = useDelayedLoading(criarMutation.isPending)
    const mostrarCarregandoStatus = useDelayedLoading(statusMutation.isPending)

    return (
        <div className="flex min-h-full flex-col md:h-full md:min-h-0">
            <ListagemCard
                title="Usuários da imobiliária"
                isLoading={isLoading}
                isEmpty={usuarios?.length === 0}
                emptyIcon={Users}
                emptyMessage="Nenhum usuário cadastrado."
                headerActions={
                    usuariosAtivos < 2 ? (
                        <Button onClick={() => setDialogAberto(true)}>
                            <Plus className="h-4 w-4" />
                            Adicionar usuário
                        </Button>
                    ) : undefined
                }
            >
                {usuarios?.map((usuario) => (
                    <div
                        key={usuario.id}
                        className="flex flex-col gap-3 rounded-md border border-border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex min-w-0 items-start gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Users className="h-4 w-4" />
                            </span>
                            <div className="flex min-w-0 flex-col gap-1">
                                <div className="flex flex-wrap items-center gap-2 font-medium">
                                    {usuario.nomeCompleto}
                                    <Badge variant={usuario.status === 'ATIVO' ? 'default' : 'outline'}>
                                        {usuario.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                    <Badge variant="outline">{PAPEL_LABEL[usuario.papel]}</Badge>
                                </div>
                                <p className="text-muted-foreground">
                                    {usuario.login} · {usuario.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 pl-11 sm:pl-0">
                            {papelMutation.isPending && papelMutation.variables?.id === usuario.id && (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            <Select
                                value={usuario.papel}
                                disabled={papelMutation.isPending}
                                onValueChange={(valor) =>
                                    papelMutation.mutate({ id: usuario.id, papel: valor as 'ADMIN' | 'PADRAO' })
                                }
                            >
                                <SelectTrigger className="h-8 w-36" aria-label="Papel do usuário">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                    <SelectItem value="PADRAO">Padrão</SelectItem>
                                </SelectContent>
                            </Select>
                            {mostrarCarregandoStatus && statusMutation.variables?.id === usuario.id && (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            <Switch
                                checked={usuario.status === 'ATIVO'}
                                disabled={statusMutation.isPending}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        statusMutation.mutate({ id: usuario.id, status: 'ATIVO' })
                                    } else {
                                        setUsuarioParaDesativar(usuario)
                                    }
                                }}
                                aria-label={usuario.status === 'ATIVO' ? 'Desativar usuário' : 'Reativar usuário'}
                            />
                        </div>
                    </div>
                ))}
            </ListagemCard>

            <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo usuário</DialogTitle>
                    </DialogHeader>
                    <form
                        className="flex flex-col gap-4"
                        noValidate
                        onSubmit={handleSubmit((values) => criarMutation.mutate(values))}
                    >
                        <div className="flex flex-col gap-1.5">
                            <Select
                                value={imobiliariaAtual ? String(imobiliariaAtual.id) : undefined}
                                onValueChange={() => {}}
                            >
                                <SelectTrigger id="imobiliaria">
                                    <SelectValue placeholder="Carregando..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {imobiliariaAtual && (
                                        <SelectItem value={String(imobiliariaAtual.id)}>
                                            {imobiliariaAtual.nomeFantasia ?? imobiliariaAtual.razaoSocial}
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Por enquanto, o usuário é sempre criado na sua própria imobiliária.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FloatingField
                                label="Nome completo"
                                htmlFor="nomeCompleto"
                                required
                                error={errors.nomeCompleto?.message}
                            >
                                <Input {...register('nomeCompleto')} />
                            </FloatingField>

                            <FloatingField label="CPF" htmlFor="cpf" required error={errors.cpf?.message}>
                                <CpfInput {...register('cpf')} />
                            </FloatingField>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Controller
                                key={formKey}
                                name="dataNascimento"
                                control={control}
                                render={({ field }) => (
                                    <FloatingField
                                        label="Data de nascimento"
                                        htmlFor="dataNascimento"
                                        required
                                        error={errors.dataNascimento?.message}
                                    >
                                        <DateInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="DD/MM/AAAA"
                                        />
                                    </FloatingField>
                                )}
                            />

                            <FloatingField label="E-mail" htmlFor="email" required error={errors.email?.message}>
                                <Input type="email" autoComplete="off" {...register('email')} />
                            </FloatingField>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FloatingField label="Usuário" htmlFor="login" required error={errors.login?.message}>
                                <Input {...register('login')} />
                            </FloatingField>

                            <Controller
                                name="papel"
                                control={control}
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

                        <FloatingField label="Senha" htmlFor="password" required error={errors.password?.message}>
                            <Input type="password" autoComplete="new-password" {...register('password')} />
                        </FloatingField>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={criarMutation.isPending}>
                                {mostrarCarregandoCriar && <Loader2 className="h-4 w-4 animate-spin" />}
                                {mostrarCarregandoCriar ? 'Salvando...' : 'Salvar'}
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => setDialogAberto(false)}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={usuarioParaDesativar !== null}
                onOpenChange={(open) => !open && setUsuarioParaDesativar(null)}
                title="Desativar este usuário?"
                description={
                    usuarioParaDesativar
                        ? `${usuarioParaDesativar.nomeCompleto} não vai conseguir mais acessar o sistema até ser reativado.`
                        : undefined
                }
                confirmLabel="Sim, desativar"
                cancelLabel="Não"
                loading={mostrarCarregandoStatus}
                onConfirm={() => {
                    if (usuarioParaDesativar) {
                        statusMutation.mutate({ id: usuarioParaDesativar.id, status: 'INATIVO' })
                    }
                }}
            />
        </div>
    )
}

export default function UsuariosPageGuard() {
    return (
        <RequirePapelAdmin>
            <UsuariosPage />
        </RequirePapelAdmin>
    )
}
