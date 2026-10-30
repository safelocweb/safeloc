import { Clock, Layers, MessageSquareText } from 'lucide-react'
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
    TipoOcorrencia,
    formatarTiposOcorrencia
} from '@/shared/constants/tipo-ocorrencia'

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

// Card padrão de ocorrência: faixa lateral e bloco de valor sempre na cor do nível da faixa de valor
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
    const Icon = tipos.length > 1 ? Layers : (TIPO_OCORRENCIA_ICON[tipos[0]] ?? TIPO_OCORRENCIA_ICON_PADRAO)
    const nivel = NIVEL_VALOR_OCORRENCIA[FAIXA_VALOR_OCORRENCIA_NIVEL[faixaValor]]

    return (
        <Componente
            className={cn(
                'relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md sm:flex-row',
                esmaecido && 'opacity-70'
            )}
        >
            <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1.5', nivel.dotClass)} />

            <div className="flex min-w-0 flex-1 gap-3 py-4 pl-5 pr-4 sm:py-5 sm:pl-6 sm:pr-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                            <p className="font-semibold leading-snug sm:pt-0.5">{formatarTiposOcorrencia(tipos)}</p>
                            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Ocorrido em {new Date(dataOcorrencia).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                        {acoes}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {gravidade && (
                            <Badge className={GRAVIDADE_OCORRENCIA_BADGE_CLASS[gravidade]}>
                                Gravidade {GRAVIDADE_OCORRENCIA_LABEL[gravidade].toLowerCase()}
                            </Badge>
                        )}
                        <Badge variant="outline">{SITUACAO_OCORRENCIA_LABEL[situacaoAtual]}</Badge>
                        {badgesExtras}
                    </div>
                    {mensagem && (
                        <p className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground/90">
                            <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="break-words">{mensagem}</span>
                        </p>
                    )}
                    {children && <div className="mt-3">{children}</div>}
                </div>
            </div>

            <div
                className={cn(
                    'flex shrink-0 items-center justify-between gap-3 border-t border-border py-3 pl-5 pr-4',
                    'sm:w-60 sm:flex-col sm:items-start sm:justify-center sm:gap-1 sm:border-l sm:border-t-0 sm:py-4 sm:pl-5 sm:pr-5',
                    nivel.softClass
                )}
            >
                <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Valor envolvido
                    </p>
                    <p className={cn('text-sm font-bold leading-tight sm:text-base', nivel.textClass)}>
                        {FAIXA_VALOR_OCORRENCIA_LABEL[faixaValor]}
                    </p>
                </div>
                <span
                    className={cn(
                        'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:mt-1 sm:text-[11px]',
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
