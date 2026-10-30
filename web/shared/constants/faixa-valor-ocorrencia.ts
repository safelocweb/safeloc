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

export type RiscoLocacao = 'BAIXO' | 'MEDIO' | 'ALTO' | 'ALTISSIMO'

// Ordem do medidor, do topo (maior risco) para a base (menor risco)
export const RISCO_LOCACAO_ORDEM: RiscoLocacao[] = ['ALTISSIMO', 'ALTO', 'MEDIO', 'BAIXO']

// Toda exibição de faixa de valor passa pelo risco — a cor sempre representa o risco, nunca a faixa isolada
export const RISCO_LOCACAO: Record<
    RiscoLocacao,
    { label: string; dotClass: string; textClass: string; softClass: string; escalaClasses: string[] }
> = {
    ALTISSIMO: {
        label: 'Altíssimo',
        dotClass: 'bg-red-600',
        textClass: 'text-red-700 dark:text-red-400',
        softClass: 'bg-red-100/70 dark:bg-red-600/15',
        escalaClasses: ['bg-red-600', 'bg-red-500', 'bg-orange-600']
    },
    ALTO: {
        label: 'Alto',
        dotClass: 'bg-orange-500',
        textClass: 'text-orange-700 dark:text-orange-300',
        softClass: 'bg-orange-50 dark:bg-orange-500/10',
        escalaClasses: ['bg-orange-500', 'bg-orange-400', 'bg-amber-400']
    },
    MEDIO: {
        label: 'Médio',
        dotClass: 'bg-yellow-400',
        textClass: 'text-yellow-700 dark:text-yellow-300',
        softClass: 'bg-yellow-50 dark:bg-yellow-400/10',
        escalaClasses: ['bg-yellow-400', 'bg-yellow-300', 'bg-lime-300']
    },
    BAIXO: {
        label: 'Baixo',
        dotClass: 'bg-green-600',
        textClass: 'text-green-700 dark:text-green-400',
        softClass: 'bg-green-50 dark:bg-green-500/10',
        escalaClasses: ['bg-lime-400', 'bg-green-500', 'bg-green-600']
    }
}

export const FAIXA_VALOR_RISCO_LOCACAO: Record<FaixaValorOcorrencia, RiscoLocacao> = {
    ATE_1_MIL: 'BAIXO',
    DE_1_MIL_A_2_MIL: 'BAIXO',
    DE_2_MIL_A_5_MIL: 'MEDIO',
    DE_5_MIL_A_10_MIL: 'ALTO',
    ACIMA_10_MIL: 'ALTISSIMO'
}
