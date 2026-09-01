export const FAIXA_VALOR_OCORRENCIA_OPTIONS = [
    { value: 'ATE_1_MIL', label: 'Até R$ 1.000' },
    { value: 'DE_1_MIL_A_2_MIL', label: 'R$ 1.000 até R$ 2.000' },
    { value: 'DE_2_MIL_A_5_MIL', label: 'R$ 2.000 até R$ 5.000' },
    { value: 'ACIMA_10_MIL', label: 'Acima de R$ 10.000' }
] as const

export type FaixaValorOcorrencia = (typeof FAIXA_VALOR_OCORRENCIA_OPTIONS)[number]['value']

export const FAIXA_VALOR_OCORRENCIA_LABEL: Record<string, string> = Object.fromEntries(
    FAIXA_VALOR_OCORRENCIA_OPTIONS.map((option) => [option.value, option.label])
)
