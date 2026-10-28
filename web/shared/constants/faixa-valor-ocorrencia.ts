export const FAIXA_VALOR_OCORRENCIA_OPTIONS = [
    { value: 'ATE_1_MIL', label: 'Até R$ 1.000' },
    { value: 'DE_1_MIL_A_2_MIL', label: 'R$ 1.000 até R$ 2.000' },
    { value: 'DE_2_MIL_A_5_MIL', label: 'R$ 2.000 até R$ 5.000' },
    { value: 'DE_5_MIL_A_10_MIL', label: 'R$ 5.000 até R$ 10.000' },
    { value: 'ACIMA_10_MIL', label: 'Acima de R$ 10.000' }
] as const

export type FaixaValorOcorrencia = (typeof FAIXA_VALOR_OCORRENCIA_OPTIONS)[number]['value']

export const FAIXA_VALOR_OCORRENCIA_LABEL: Record<string, string> = Object.fromEntries(
    FAIXA_VALOR_OCORRENCIA_OPTIONS.map((option) => [option.value, option.label])
)

export type NivelValorOcorrencia = 'MUITO_BAIXO' | 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO'

// Toda exibição de faixa de valor passa pelo nível — a cor sempre representa o nível, nunca a faixa isolada
export const NIVEL_VALOR_OCORRENCIA: Record<
    NivelValorOcorrencia,
    { label: string; shortLabel: string; badgeClass: string; dotClass: string; textClass: string; softClass: string }
> = {
    MUITO_BAIXO: {
        label: 'Valor muito baixo',
        shortLabel: 'Muito baixo',
        badgeClass:
            'border-green-800 bg-green-800 text-white dark:border-green-400/40 dark:bg-green-500/20 dark:text-green-200',
        dotClass: 'bg-green-800 dark:bg-green-500',
        textClass: 'text-green-800 dark:text-green-400',
        softClass: 'bg-green-50 dark:bg-green-500/10'
    },
    BAIXO: {
        label: 'Valor baixo',
        shortLabel: 'Baixo',
        badgeClass:
            'border-yellow-300 bg-yellow-100 text-yellow-800 dark:border-yellow-400/40 dark:bg-yellow-400/15 dark:text-yellow-300',
        dotClass: 'bg-yellow-400',
        textClass: 'text-yellow-700 dark:text-yellow-300',
        softClass: 'bg-yellow-50 dark:bg-yellow-400/10'
    },
    MEDIO: {
        label: 'Valor médio',
        shortLabel: 'Médio',
        badgeClass:
            'border-orange-300 bg-orange-100 text-orange-800 dark:border-orange-400/40 dark:bg-orange-500/15 dark:text-orange-300',
        dotClass: 'bg-orange-500',
        textClass: 'text-orange-700 dark:text-orange-300',
        softClass: 'bg-orange-50 dark:bg-orange-500/10'
    },
    ALTO: {
        label: 'Valor alto',
        shortLabel: 'Alto',
        badgeClass: 'border-red-300 bg-red-100 text-red-700 dark:border-red-400/40 dark:bg-red-500/15 dark:text-red-300',
        dotClass: 'bg-red-400',
        textClass: 'text-red-600 dark:text-red-300',
        softClass: 'bg-red-50 dark:bg-red-500/10'
    },
    CRITICO: {
        label: 'Valor crítico',
        shortLabel: 'Crítico',
        badgeClass: 'border-red-800 bg-red-700 text-white dark:border-red-500 dark:bg-red-700 dark:text-white',
        dotClass: 'bg-red-700',
        textClass: 'text-red-700 dark:text-red-400',
        softClass: 'bg-red-100/70 dark:bg-red-600/15'
    }
}

export const FAIXA_VALOR_OCORRENCIA_NIVEL: Record<FaixaValorOcorrencia, NivelValorOcorrencia> = {
    ATE_1_MIL: 'MUITO_BAIXO',
    DE_1_MIL_A_2_MIL: 'BAIXO',
    DE_2_MIL_A_5_MIL: 'MEDIO',
    DE_5_MIL_A_10_MIL: 'ALTO',
    ACIMA_10_MIL: 'CRITICO'
}
