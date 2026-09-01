'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { RequirePapelAdmin } from '@/components/require-papel-admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { CpfInput } from '@/components/ui/cpf-input'
import { DateInput } from '@/components/ui/date-input'
import { FloatingField } from '@/components/ui/floating-field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getErrorMessage } from '@/lib/get-error-message'
import { isCpfComplete } from '@/lib/format-cpf'
import { useDelayedLoading } from '@/lib/use-delayed-loading'
import { ocorrenciaService, OcorrenciaCreateInput } from '@/app/services/ocorrencia.service'
import { TIPO_OCORRENCIA_OPTIONS } from '@/shared/constants/tipo-ocorrencia'
import { SITUACAO_OCORRENCIA_OPTIONS } from '@/shared/constants/situacao-ocorrencia'
import { FAIXA_VALOR_OCORRENCIA_OPTIONS } from '@/shared/constants/faixa-valor-ocorrencia'
import { GRAVIDADE_OCORRENCIA_OPTIONS } from '@/shared/constants/gravidade-ocorrencia'

const dataNaoFutura = (valor: string) => new Date(valor) <= new Date()

const inserirSchema = z.object({
    nomeInquilinoInformado: z.string().min(1, 'Informe o nome completo do inquilino'),
    cpfInquilino: z.string().refine(isCpfComplete, 'Informe um CPF válido'),
    dataNascimentoInquilino: z
        .string()
        .min(1, 'Informe a data de nascimento')
        .refine(dataNaoFutura, 'Data de nascimento não pode ser no futuro'),
    tipo: z.string().min(1, 'Selecione o tipo de ocorrência'),
    dataOcorrencia: z
        .string()
        .min(1, 'Informe a data da ocorrência')
        .refine(dataNaoFutura, 'Data da ocorrência não pode ser no futuro'),
    situacaoAtual: z.string().min(1, 'Selecione a situação atual'),
    faixaValor: z.string().min(1, 'Selecione a faixa de valor'),
    gravidade: z.string().min(1, 'Selecione a gravidade'),
    declaracaoFundamento: z.boolean().refine((valor) => valor, 'Confirme esta declaração'),
    declaracaoVeracidade: z.boolean().refine((valor) => valor, 'Confirme esta declaração'),
    declaracaoCiencia: z.boolean().refine((valor) => valor, 'Confirme esta declaração')
})

type InserirFormValues = z.infer<typeof inserirSchema>

const DECLARACOES: { name: 'declaracaoFundamento' | 'declaracaoVeracidade' | 'declaracaoCiencia'; texto: string }[] = [
    {
        name: 'declaracaoFundamento',
        texto: 'Declaro que a ocorrência registrada possui fundamento contratual ou documental.'
    },
    {
        name: 'declaracaoVeracidade',
        texto: 'Declaro que as informações inseridas são verdadeiras e de responsabilidade exclusiva da imobiliária registrante.'
    },
    {
        name: 'declaracaoCiencia',
        texto: 'Estou ciente de que todas as operações são registradas e auditadas.'
    }
]

function InserirPage() {
    const [formKey, setFormKey] = useState(0)

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<InserirFormValues>({
        resolver: zodResolver(inserirSchema),
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
        defaultValues: {
            nomeInquilinoInformado: '',
            cpfInquilino: '',
            dataNascimentoInquilino: '',
            tipo: '',
            dataOcorrencia: '',
            situacaoAtual: '',
            faixaValor: '',
            gravidade: '',
            declaracaoFundamento: false,
            declaracaoVeracidade: false,
            declaracaoCiencia: false
        }
    })

    const inserirMutation = useMutation({
        mutationFn: (values: InserirFormValues) => {
            const { declaracaoFundamento, declaracaoVeracidade, declaracaoCiencia, ...input } = values
            return ocorrenciaService.inserir(input as OcorrenciaCreateInput)
        },
        onSuccess: () => {
            toast.success('Ocorrência registrada com sucesso.')
            reset()
            setFormKey((atual) => atual + 1)
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Não foi possível registrar a ocorrência. Tente novamente.'))
        }
    })

    const mostrarCarregando = useDelayedLoading(inserirMutation.isPending)

    const declaracoesMarcadas = DECLARACOES.map((declaracao) => watch(declaracao.name))
    const todasDeclaracoesMarcadas = declaracoesMarcadas.every(Boolean)

    function alternarTodasDeclaracoes(marcar: boolean) {
        DECLARACOES.forEach((declaracao) => {
            setValue(declaracao.name, marcar, { shouldValidate: true })
        })
    }

    return (
        <Card className="flex min-h-full flex-col md:h-full md:min-h-0">
            <CardHeader className="shrink-0">
                <CardTitle>Inserir informações</CardTitle>
                <CardDescription>Registre uma ocorrência locatícia de um inquilino</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col md:min-h-0 md:overflow-y-auto">
                <form
                    className="flex w-full flex-1 flex-col gap-7 sm:gap-8"
                    noValidate
                    onSubmit={handleSubmit((values) => inserirMutation.mutate(values))}
                >
                    <div className="flex shrink-0 flex-col gap-4">
                        <p className="text-sm font-semibold text-foreground">Dados do inquilino</p>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 lg:col-span-6">
                                <FloatingField
                                    label="Nome completo do inquilino"
                                    htmlFor="nomeInquilinoInformado"
                                    required
                                    error={errors.nomeInquilinoInformado?.message}
                                    className="mt-0"
                                >
                                    <Input {...register('nomeInquilinoInformado')} />
                                </FloatingField>
                            </div>

                            <div className="col-span-6 lg:col-span-3">
                                <FloatingField
                                    label="CPF"
                                    htmlFor="cpfInquilino"
                                    required
                                    error={errors.cpfInquilino?.message}
                                    className="mt-0"
                                >
                                    <CpfInput {...register('cpfInquilino')} />
                                </FloatingField>
                            </div>

                            <div className="col-span-6 lg:col-span-3">
                                <Controller
                                    key={formKey}
                                    name="dataNascimentoInquilino"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingField
                                            label="Data de nascimento"
                                            htmlFor="dataNascimentoInquilino"
                                            required
                                            error={errors.dataNascimentoInquilino?.message}
                                            className="mt-0"
                                        >
                                            <DateInput
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="DD/MM/AAAA"
                                            />
                                        </FloatingField>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-4 border-t border-border pt-7 sm:pt-8">
                        <p className="text-sm font-semibold text-foreground">Dados da ocorrência</p>
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-12 flex flex-col gap-1.5 sm:col-span-6 lg:col-span-3">
                                <Controller
                                    key={formKey}
                                    name="tipo"
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger id="tipo">
                                                <SelectValue placeholder="Tipo de ocorrência" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TIPO_OCORRENCIA_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.tipo && <p className="text-xs text-destructive">{errors.tipo.message}</p>}
                            </div>

                            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
                                <Controller
                                    key={formKey}
                                    name="dataOcorrencia"
                                    control={control}
                                    render={({ field }) => (
                                        <FloatingField
                                            label="Data da ocorrência"
                                            htmlFor="dataOcorrencia"
                                            required
                                            error={errors.dataOcorrencia?.message}
                                            className="mt-0"
                                        >
                                            <DateInput
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="DD/MM/AAAA"
                                            />
                                        </FloatingField>
                                    )}
                                />
                            </div>

                            <div className="col-span-12 flex flex-col gap-1.5 sm:col-span-6 lg:col-span-3">
                                <Controller
                                    key={formKey}
                                    name="situacaoAtual"
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger id="situacaoAtual">
                                                <SelectValue placeholder="Situação atual" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SITUACAO_OCORRENCIA_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.situacaoAtual && (
                                    <p className="text-xs text-destructive">{errors.situacaoAtual.message}</p>
                                )}
                            </div>

                            <div className="col-span-12 flex flex-col gap-1.5 sm:col-span-6 lg:col-span-3">
                                <Controller
                                    key={formKey}
                                    name="faixaValor"
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger id="faixaValor">
                                                <SelectValue placeholder="Faixa de valor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {FAIXA_VALOR_OCORRENCIA_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.faixaValor && (
                                    <p className="text-xs text-destructive">{errors.faixaValor.message}</p>
                                )}
                            </div>

                            <div className="col-span-12 flex flex-col gap-1.5 sm:col-span-6 lg:col-span-3">
                                <Controller
                                    key={formKey}
                                    name="gravidade"
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger id="gravidade">
                                                <SelectValue placeholder="Gravidade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {GRAVIDADE_OCORRENCIA_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.gravidade && (
                                    <p className="text-xs text-destructive">{errors.gravidade.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:p-5">
                        <div className="flex flex-col gap-3">
                            <p className="text-sm font-medium text-foreground">Declaração obrigatória</p>
                            {DECLARACOES.map((declaracao) => (
                                <label
                                    key={declaracao.name}
                                    htmlFor={declaracao.name}
                                    className="flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground"
                                >
                                    <Controller
                                        key={formKey}
                                        name={declaracao.name}
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox
                                                id={declaracao.name}
                                                className="mt-0.5"
                                                checked={field.value}
                                                onCheckedChange={(checked) => field.onChange(checked === true)}
                                            />
                                        )}
                                    />
                                    <span>{declaracao.texto}</span>
                                </label>
                            ))}
                        </div>

                        <label
                            htmlFor="aceitarTodasDeclaracoes"
                            className="mt-3 flex cursor-pointer items-start gap-2.5 border-t border-border pt-4 text-sm font-medium text-foreground"
                        >
                            <Checkbox
                                id="aceitarTodasDeclaracoes"
                                className="mt-0.5"
                                checked={todasDeclaracoesMarcadas}
                                onCheckedChange={(checked) => alternarTodasDeclaracoes(checked === true)}
                            />
                            <span>Aceito todos os termos acima</span>
                        </label>
                    </div>

                    <div className="hidden flex-1 md:block" />

                    <Button
                        type="submit"
                        className="shrink-0 lg:w-fit lg:self-end"
                        disabled={inserirMutation.isPending}
                    >
                        {mostrarCarregando && <Loader2 className="h-4 w-4 animate-spin" />}
                        {mostrarCarregando ? 'Registrando...' : 'Confirmar'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default function InserirPageGuard() {
    return (
        <RequirePapelAdmin>
            <InserirPage />
        </RequirePapelAdmin>
    )
}
