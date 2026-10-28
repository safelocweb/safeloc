import { Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
    FAIXA_VALOR_OCORRENCIA_LABEL,
    FAIXA_VALOR_OCORRENCIA_NIVEL,
    FaixaValorOcorrencia,
    NIVEL_VALOR_OCORRENCIA
} from '@/shared/constants/faixa-valor-ocorrencia'
import { GRAVIDADE_OCORRENCIA_BADGE_CLASS, GRAVIDADE_OCORRENCIA_LABEL, GravidadeOcorrencia } from '@/shared/constants/gravidade-ocorrencia'
import { SITUACAO_OCORRENCIA_LABEL, SituacaoOcorrencia } from '@/shared/constants/situacao-ocorrencia'
import {
    TIPO_OCORRENCIA_ICON,
    TIPO_OCORRENCIA_ICON_PADRAO,
    TIPO_OCORRENCIA_LABEL,
    TipoOcorrencia
} from '@/shared/constants/tipo-ocorrencia'

interface OcorrenciaCardProps {
    as?: 'li' | 'div'
    tipo: TipoOcorrencia
    dataOcorrencia: string
    situacaoAtual: SituacaoOcorrencia
    faixaValor: FaixaValorOcorrencia
    gravidade?: GravidadeOcorrencia
    badgesExtras?: React.ReactNode
    acoes?: React.ReactNode
    esmaecido?: boolean
    children?: React.ReactNode
}

// Card padrão de ocorrência: faixa lateral e bloco de valor sempre na cor do nível da faixa de valor
export function OcorrenciaCard({
    as: Componente = 'div',
    tipo,
    dataOcorrencia,
    situacaoAtual,
    faixaValor,
    gravidade,
    badgesExtras,
    acoes,
    esmaecido = false,
    children
}: OcorrenciaCardProps) {
    const Icon = TIPO_OCORRENCIA_ICON[tipo] ?? TIPO_OCORRENCIA_ICON_PADRAO
    const nivel = NIVEL_VALOR_OCORRENCIA[FAIXA_VALOR_OCORRENCIA_NIVEL[faixaValor]]

    return (
        <Componente
            className={cn(
                'relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md sm:flex-row',
                esmaecido && 'opacity-70'
            )}
        >
            <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1.5', nivel.dotClass)} />

            <div className="min-w-0 flex-1 py-5 pl-6 pr-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <Icon className="h-4 w-4" />
                        </span>
                        <span className="font-semibold">{TIPO_OCORRENCIA_LABEL[tipo] ?? tipo}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Ocorrido em {new Date(dataOcorrencia).toLocaleDateString('pt-BR')}
                        </span>
                        {acoes}
                    </div>
                </div>
                <div className="pl-11">
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {gravidade && (
                            <Badge className={GRAVIDADE_OCORRENCIA_BADGE_CLASS[gravidade]}>
                                Gravidade {GRAVIDADE_OCORRENCIA_LABEL[gravidade].toLowerCase()}
                            </Badge>
                        )}
                        <Badge variant="outline">{SITUACAO_OCORRENCIA_LABEL[situacaoAtual]}</Badge>
                        {badgesExtras}
                    </div>
                    {children && <div className="mt-3">{children}</div>}
                </div>
            </div>

            <div
                className={cn(
                    'flex shrink-0 flex-col justify-center gap-1 border-t border-border py-4 pl-6 pr-5 sm:w-60 sm:border-l sm:border-t-0 sm:pl-5',
                    nivel.softClass
                )}
            >
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Valor envolvido
                </p>
                <p className={cn('text-base font-bold leading-tight', nivel.textClass)}>
                    {FAIXA_VALOR_OCORRENCIA_LABEL[faixaValor]}
                </p>
                <span
                    className={cn(
                        'mt-1 inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide',
                        nivel.badgeClass
                    )}
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    Nível {nivel.shortLabel.toLowerCase()}
                </span>
            </div>
        </Componente>
    )
}
