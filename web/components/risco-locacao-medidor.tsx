import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RISCO_LOCACAO, RISCO_LOCACAO_ORDEM, RiscoLocacao } from '@/shared/constants/faixa-valor-ocorrencia'

interface RiscoLocacaoMedidorProps {
    risco: RiscoLocacao
    className?: string
}

// Termômetro com seta apontando para o risco atual: horizontal no mobile (verde à esquerda), vertical a partir de sm (verde na base)
export function RiscoLocacaoMedidor({ risco, className }: RiscoLocacaoMedidorProps) {
    const { label, textClass } = RISCO_LOCACAO[risco]

    return (
        <div className={cn('flex flex-col items-end gap-1.5 sm:items-start', className)}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Risco de locação
            </p>
            <div role="img" aria-label={`Risco de locação ${label.toLowerCase()}`}>
                <MedidorHorizontal risco={risco} label={label} textClass={textClass} />
                <MedidorVertical risco={risco} label={label} textClass={textClass} />
            </div>
        </div>
    )
}

interface MedidorProps {
    risco: RiscoLocacao
    label: string
    textClass: string
}

function MedidorHorizontal({ risco, label, textClass }: MedidorProps) {
    const ordemCrescente = [...RISCO_LOCACAO_ORDEM].reverse()

    return (
        <div aria-hidden className="flex items-start gap-2 sm:hidden">
            <div className="flex w-24 gap-px">
                {ordemCrescente.map((nivel, indiceNivel) => (
                    <div key={nivel} className="flex flex-1 flex-col items-center gap-0.5">
                        <div
                            className={cn(
                                'flex h-2 w-full overflow-hidden',
                                indiceNivel === 0 && 'rounded-l-full',
                                indiceNivel === ordemCrescente.length - 1 && 'rounded-r-full'
                            )}
                        >
                            {[...RISCO_LOCACAO[nivel].escalaClasses].reverse().map((corClass, indice) => (
                                <span key={indice} className={cn('flex-1', corClass)} />
                            ))}
                        </div>
                        <span
                            className={cn(
                                'h-0 w-0 border-x-4 border-b-[5px] border-x-transparent border-b-foreground',
                                nivel !== risco && 'invisible'
                            )}
                        />
                    </div>
                ))}
            </div>
            <span className={cn('-mt-0.5 text-[11px] font-bold uppercase leading-none tracking-wide', textClass)}>
                {label}
            </span>
        </div>
    )
}

function MedidorVertical({ risco, label, textClass }: MedidorProps) {
    return (
        <div aria-hidden className="hidden gap-1.5 sm:flex">
            <div className="flex w-3.5 flex-col overflow-hidden rounded-[3px]">
                {RISCO_LOCACAO_ORDEM.flatMap((nivel) =>
                    RISCO_LOCACAO[nivel].escalaClasses.map((corClass, indice) => (
                        <span key={`${nivel}-${indice}`} className={cn('h-1.5', corClass)} />
                    ))
                )}
            </div>
            <div className="flex flex-col">
                {RISCO_LOCACAO_ORDEM.map((nivel) => (
                    <div key={nivel} className="flex h-[18px] items-center gap-1">
                        {nivel === risco && (
                            <>
                                <ArrowLeft className="h-4 w-4 shrink-0 text-foreground" strokeWidth={2.5} />
                                <span className={cn('text-[11px] font-bold uppercase tracking-wide', textClass)}>
                                    {label}
                                </span>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
