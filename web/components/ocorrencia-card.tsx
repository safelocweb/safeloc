'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, MessageSquareText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { RiscoLocacaoMedidor } from '@/components/risco-locacao-medidor'
import {
    FAIXA_VALOR_OCORRENCIA_LABEL,
    FAIXA_VALOR_RISCO_LOCACAO,
    FaixaValorOcorrencia,
    RISCO_LOCACAO
} from '@/shared/constants/faixa-valor-ocorrencia'
import { GRAVIDADE_OCORRENCIA_BADGE_CLASS, GRAVIDADE_OCORRENCIA_LABEL, GravidadeOcorrencia } from '@/shared/constants/gravidade-ocorrencia'
import { SITUACAO_OCORRENCIA_LABEL, SituacaoOcorrencia } from '@/shared/constants/situacao-ocorrencia'
import {
    TIPO_OCORRENCIA_ICON,
    TIPO_OCORRENCIA_ICON_PADRAO,
    TIPO_OCORRENCIA_LABEL,
    TipoOcorrencia
} from '@/shared/constants/tipo-ocorrencia'

// Acima disso os tipos ficam recolhidos atrás de um "+N" para o card não crescer demais
const LIMITE_TIPOS_VISIVEIS = 3

interface OcorrenciaCardProps {
    as?: 'li' | 'div'
    tipos: TipoOcorrencia[]
    dataOcorrencia: string
    situacaoAtual: SituacaoOcorrencia
    faixaValor: FaixaValorOcorrencia
    gravidade?: GravidadeOcorrencia
    mensagem?: string | null
    badgesExtras?: React.ReactNode
    acoes?: React.ReactNode
    esmaecido?: boolean
    children?: React.ReactNode
}

// Card padrão de ocorrência: faixa lateral e bloco de valor sempre na cor do risco de locação da faixa de valor
export function OcorrenciaCard({
    as: Componente = 'div',
    tipos,
    dataOcorrencia,
    situacaoAtual,
    faixaValor,
    gravidade,
    mensagem,
    badgesExtras,
    acoes,
    esmaecido = false,
    children
}: OcorrenciaCardProps) {
    // O primeiro tipo selecionado vira o título; os demais aparecem como "+N" ao lado e listados abaixo
    const [tipoPrincipal, ...outrosTipos] = tipos
    const Icon = TIPO_OCORRENCIA_ICON[tipoPrincipal] ?? TIPO_OCORRENCIA_ICON_PADRAO
    const risco = FAIXA_VALOR_RISCO_LOCACAO[faixaValor]
    const estiloRisco = RISCO_LOCACAO[risco]

    return (
        <Componente
            className={cn(
                'relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md sm:flex-row',
                esmaecido && 'opacity-70'
            )}
        >
            <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1.5', estiloRisco.dotClass)} />

            <div className="flex min-w-0 flex-1 flex-col gap-3 py-4 pl-5 pr-4 sm:py-5 sm:pl-6 sm:pr-5">
                <div className="flex items-start gap-3">
                    <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground sm:flex">
                        <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:pt-1">
                        <p className="flex min-w-0 items-center gap-2 font-semibold leading-snug">
                            <span className="truncate">{TIPO_OCORRENCIA_LABEL[tipoPrincipal] ?? tipoPrincipal}</span>
                            {outrosTipos.length > 0 && (
                                <span
                                    title={`Mais ${outrosTipos.length} ${outrosTipos.length === 1 ? 'tipo' : 'tipos'} de ocorrência`}
                                    className="inline-flex h-5 shrink-0 items-center rounded-full bg-primary/10 px-2 text-[11px] font-bold text-primary"
                                >
                                    +{outrosTipos.length}
                                </span>
                            )}
                        </p>
                        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Ocorrido em {new Date(dataOcorrencia).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                    {acoes}
                </div>

                {/* No mobile não há ícone e tudo começa na mesma borda; a partir de sm alinha com o título (ícone 32px + gap 12px) */}
                <div className="flex min-w-0 flex-col gap-3 sm:pl-11">
                    <div className="flex flex-wrap gap-1.5">
                        {gravidade && (
                            <Badge className={GRAVIDADE_OCORRENCIA_BADGE_CLASS[gravidade]}>
                                Gravidade {GRAVIDADE_OCORRENCIA_LABEL[gravidade].toLowerCase()}
                            </Badge>
                        )}
                        <Badge variant="outline">{SITUACAO_OCORRENCIA_LABEL[situacaoAtual]}</Badge>
                        {badgesExtras}
                    </div>
                    {outrosTipos.length > 0 && <TiposOcorrenciaChips tipos={outrosTipos} />}
                    {mensagem && (
                        <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground/90">
                            <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="min-w-0 break-words">{mensagem}</span>
                        </p>
                    )}
                    {children && <div>{children}</div>}
                </div>
            </div>

            <div
                className={cn(
                    'flex shrink-0 items-center justify-between gap-4 border-t border-border py-3.5 pl-5 pr-4',
                    'sm:w-52 sm:flex-col sm:items-start sm:justify-center sm:gap-3 sm:border-l sm:border-t-0 sm:py-4 sm:pl-5 sm:pr-4',
                    estiloRisco.softClass
                )}
            >
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Valor envolvido
                    </p>
                    <p className={cn('text-sm font-bold leading-tight', estiloRisco.textClass)}>
                        {FAIXA_VALOR_OCORRENCIA_LABEL[faixaValor]}
                    </p>
                </div>
                <RiscoLocacaoMedidor risco={risco} className="shrink-0" />
            </div>
        </Componente>
    )
}

function TiposOcorrenciaChips({ tipos }: { tipos: TipoOcorrencia[] }) {
    const [expandido, setExpandido] = useState(false)
    const ocultos = tipos.length - LIMITE_TIPOS_VISIVEIS
    const visiveis = expandido || ocultos <= 0 ? tipos : tipos.slice(0, LIMITE_TIPOS_VISIVEIS)

    return (
        <ul className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
            {visiveis.map((tipo) => {
                const TipoIcon = TIPO_OCORRENCIA_ICON[tipo] ?? TIPO_OCORRENCIA_ICON_PADRAO
                return (
                    <li
                        key={tipo}
                        title={TIPO_OCORRENCIA_LABEL[tipo] ?? tipo}
                        className="inline-flex h-7 min-w-0 max-w-full items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 text-xs text-foreground/90 sm:h-6 sm:gap-1"
                    >
                        <TipoIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="truncate">{TIPO_OCORRENCIA_LABEL[tipo] ?? tipo}</span>
                    </li>
                )
            })}
            {ocultos > 0 && (
                <li className="flex">
                    <button
                        type="button"
                        onClick={() => setExpandido((atual) => !atual)}
                        aria-expanded={expandido}
                        className={cn(
                            'group inline-flex h-7 w-full items-center justify-center gap-1 rounded-md border border-primary/25 bg-primary/10 px-2 text-xs font-semibold text-primary transition-colors sm:h-6 sm:w-auto',
                            'hover:border-primary/40 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                        )}
                    >
                        {expandido ? (
                            <ChevronUp className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                            <span className="flex h-4 min-w-[1rem] items-center justify-center rounded bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
                                +{ocultos}
                            </span>
                        )}
                        {expandido ? 'Mostrar menos' : ocultos === 1 ? 'tipo' : 'tipos'}
                        {!expandido && (
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-y-px" />
                        )}
                    </button>
                </li>
            )}
        </ul>
    )
}
