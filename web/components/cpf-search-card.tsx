'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Info, Loader2, Search, type LucideIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CpfInput } from '@/components/ui/cpf-input'
import { FloatingField } from '@/components/ui/floating-field'
import { cn } from '@/lib/utils'
import { isCpfComplete } from '@/lib/format-cpf'
import { useDelayedLoading } from '@/lib/use-delayed-loading'

const cpfSchema = z.object({
    cpf: z.string().refine(isCpfComplete, 'Informe um CPF válido')
})

type CpfFormValues = z.infer<typeof cpfSchema>

export interface CpfSearchCardProps {
    icon?: LucideIcon
    title: string
    description: string
    buttonLabel?: string
    buttonLoadingLabel?: string
    isPending: boolean
    onSubmit: (cpf: string) => void
}

export function CpfSearchCard({
    icon: Icon,
    title,
    description,
    buttonLabel = 'Consultar',
    buttonLoadingLabel = 'Consultando...',
    isPending,
    onSubmit
}: CpfSearchCardProps) {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<CpfFormValues>({
        resolver: zodResolver(cpfSchema),
        mode: 'onSubmit',
        reValidateMode: 'onSubmit'
    })
    const mostrarCarregando = useDelayedLoading(isPending)

    return (
        <Card>
            <CardHeader className="flex-row items-center gap-3 space-y-0">
                {Icon && (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                    </span>
                )}
                <div className="flex flex-col gap-1">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <form
                    className="flex flex-col gap-5"
                    noValidate
                    onSubmit={handleSubmit((values) => onSubmit(values.cpf))}
                >
                    <FloatingField
                        label="CPF do inquilino"
                        htmlFor="cpf"
                        required
                        error={errors.cpf?.message}
                        icon={Search}
                    >
                        <CpfInput
                            className={cn('h-11 sm:h-11', errors.cpf && 'border-destructive')}
                            {...register('cpf')}
                        />
                    </FloatingField>

                    <Button type="submit" size="lg" disabled={isPending}>
                        {mostrarCarregando && <Loader2 className="h-4 w-4 animate-spin" />}
                        {mostrarCarregando ? buttonLoadingLabel : buttonLabel}
                    </Button>
                </form>
            </CardContent>

            <div className="flex items-start gap-2 rounded-b-xl border-t border-border bg-muted/40 px-6 py-3">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                    A consulta somente poderá ser realizada para fins de análise locatícia legítima, sendo vedada
                    qualquer utilização diversa. Todas as consultas são registradas e auditadas.
                </p>
            </div>
        </Card>
    )
}
