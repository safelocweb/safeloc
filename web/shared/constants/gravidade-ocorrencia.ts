export const GRAVIDADE_OCORRENCIA_OPTIONS = [
    { value: 'BAIXA', label: 'Baixa' },
    { value: 'MEDIA', label: 'Média' },
    { value: 'ALTA', label: 'Alta' }
] as const

export type GravidadeOcorrencia = (typeof GRAVIDADE_OCORRENCIA_OPTIONS)[number]['value']

export const GRAVIDADE_OCORRENCIA_LABEL: Record<string, string> = Object.fromEntries(
    GRAVIDADE_OCORRENCIA_OPTIONS.map((option) => [option.value, option.label])
)

export const GRAVIDADE_OCORRENCIA_BADGE_CLASS: Record<string, string> = {
    BAIXA: 'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    MEDIA: 'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    ALTA: 'border-transparent bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
}

export const GRAVIDADE_OCORRENCIA_CHART_COLOR: Record<string, string> = {
    BAIXA: 'var(--chart-good)',
    MEDIA: 'var(--chart-warning)',
    ALTA: 'var(--chart-critical)'
}
