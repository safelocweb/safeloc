'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FloatingField } from '@/components/ui/floating-field'
import { Input } from '@/components/ui/input'
import { authService } from '@/app/services/auth.service'
import { getErrorMessage } from '@/lib/get-error-message'
import { useDelayedLoading } from '@/lib/use-delayed-loading'

const loginSchema = z.object({
    login: z.string().min(1, 'Informe o usuário ou e-mail'),
    password: z.string().min(1, 'Informe a senha')
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    )
}

function LoginForm() {
    const [enviando, setEnviando] = useState(false)
    const [mostrarSenha, setMostrarSenha] = useState(false)
    const searchParams = useSearchParams()
    const mostrarCarregando = useDelayedLoading(enviando)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        mode: 'onSubmit',
        reValidateMode: 'onSubmit'
    })

    async function onSubmit(values: LoginFormValues) {
        setEnviando(true)
        try {
            await authService.login(values.login, values.password)
            const returnTo = searchParams.get('returnTo')
            window.location.href = returnTo || '/'
        } catch (error) {
            toast.error(getErrorMessage(error, 'Login ou senha incorretos'))
            setEnviando(false)
        }
    }

    return (
        <Card className="w-full overflow-hidden shadow-xl shadow-black/5">
            <div className="h-1 w-full bg-gradient-to-r from-primary to-[hsl(200_47%_16%)]" />

            <CardContent className="flex flex-col items-center gap-3 p-6">
                <Image
                    src="/logo.png"
                    alt="Safeloc"
                    width={72}
                    height={72}
                    priority
                    className="h-[4.5rem] w-[4.5rem] rounded-2xl shadow-lg shadow-primary/25"
                />

                <div className="text-center">
                    <p className="text-xl font-bold tracking-tight">
                        Safe<span className="text-primary">loc</span>
                    </p>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Locação segura para imobiliárias
                    </p>
                </div>

                <div className="flex items-center gap-1.5 py-1" aria-hidden>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="h-1 w-1 rounded-full bg-border" />
                </div>

                <form className="flex w-full flex-col gap-4 pt-2" onSubmit={handleSubmit(onSubmit)}>
                    <FloatingField
                        label="Usuário ou e-mail"
                        htmlFor="login"
                        required
                        error={errors.login?.message}
                    >
                        <Input autoComplete="username" {...register('login')} />
                    </FloatingField>

                    <FloatingField
                        label="Senha"
                        htmlFor="password"
                        required
                        error={errors.password?.message}
                        trailing={
                            <button
                                type="button"
                                onClick={() => setMostrarSenha((valor) => !valor)}
                                className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-muted-foreground hover:text-foreground"
                                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                            >
                                {mostrarSenha ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        }
                    >
                        <Input
                            type={mostrarSenha ? 'text' : 'password'}
                            autoComplete="current-password"
                            className="pr-10"
                            {...register('password')}
                        />
                    </FloatingField>

                    <Button
                        type="submit"
                        size="lg"
                        className="shadow-lg shadow-primary/30"
                        disabled={enviando}
                    >
                        {mostrarCarregando && <Loader2 className="h-4 w-4 animate-spin" />}
                        {mostrarCarregando ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
