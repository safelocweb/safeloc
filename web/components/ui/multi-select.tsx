'use client'

import * as React from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNonPassiveWheelScroll } from '@/lib/use-non-passive-wheel-scroll'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface MultiSelectOption {
    value: string
    label: string
}

interface MultiSelectProps {
    id?: string
    options: readonly MultiSelectOption[]
    value: string[]
    onValueChange: (value: string[]) => void
    placeholder?: string
    disabled?: boolean
    invalid?: boolean
    className?: string
}

// Mesmo teto do SelectMultiRHF do CRM: no máximo 3 chips, o restante vira "+N"
const MAX_CHIPS_VISIVEIS = 3

const CHIP_CLASS = 'inline-flex h-6 items-center gap-1 rounded-full border border-border bg-muted px-2 text-xs font-medium text-foreground'

// Ação clicável dentro do trigger (que já é um <button>): span com role=button e sem propagar o clique pro popover
function AcaoInterna({
    onAcionar,
    className,
    label,
    children
}: {
    onAcionar: () => void
    className?: string
    label: string
    children: React.ReactNode
}) {
    return (
        <span
            role="button"
            tabIndex={0}
            aria-label={label}
            className={cn('shrink-0 cursor-pointer rounded-full', className)}
            onClick={(event) => {
                event.stopPropagation()
                onAcionar()
            }}
            onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return
                event.preventDefault()
                event.stopPropagation()
                onAcionar()
            }}
        >
            {children}
        </span>
    )
}

const MultiSelect = ({
    id,
    options,
    value,
    onValueChange,
    placeholder = 'Selecione...',
    disabled,
    invalid,
    className
}: MultiSelectProps) => {
    const listRef = useNonPassiveWheelScroll<HTMLDivElement>()
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const chipsRef = React.useRef<HTMLDivElement>(null)
    const [larguraTrigger, setLarguraTrigger] = React.useState(0)

    // Mantém a ordem das opções, independente da ordem em que foram marcadas
    const selecionados = options.filter((option) => value.includes(option.value))

    // A cada mudança de seleção/largura, tenta exibir tudo e vai tirando chips até caber numa linha só
    const chaveMedicao = `${selecionados.map((option) => option.value).join('|')}#${larguraTrigger}`
    const visiveisIniciais = Math.min(selecionados.length, MAX_CHIPS_VISIVEIS)
    const [medicao, setMedicao] = React.useState({ chave: chaveMedicao, visiveis: visiveisIniciais })
    if (medicao.chave !== chaveMedicao) setMedicao({ chave: chaveMedicao, visiveis: visiveisIniciais })

    const exibidos = selecionados.slice(0, Math.max(1, medicao.visiveis))
    const ocultos = selecionados.slice(exibidos.length)

    function emitir(proximo: string[]) {
        onValueChange(options.map((option) => option.value).filter((item) => proximo.includes(item)))
    }

    function alternar(valor: string) {
        emitir(value.includes(valor) ? value.filter((item) => item !== valor) : [...value, valor])
    }

    // Acompanha a largura do campo para recalcular quantos chips cabem
    React.useEffect(() => {
        const trigger = triggerRef.current
        if (!trigger) return
        const observer = new ResizeObserver(([entrada]) => setLarguraTrigger(Math.round(entrada.contentRect.width)))
        observer.observe(trigger)
        return () => observer.disconnect()
    }, [])

    React.useLayoutEffect(() => {
        const container = chipsRef.current
        if (!container || medicao.visiveis <= 1) return
        if (container.scrollWidth > container.clientWidth + 1) {
            setMedicao((atual) => ({ ...atual, visiveis: atual.visiveis - 1 }))
        }
    }, [medicao])

    return (
        <TooltipProvider delayDuration={200}>
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        ref={triggerRef}
                        id={id}
                        type="button"
                        disabled={disabled}
                        aria-label={`${placeholder}. ${selecionados.length} de ${options.length} selecionados`}
                        className={cn(
                            'flex h-11 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-base sm:h-10 sm:text-sm',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            'focus:outline-none focus:ring-2 focus:ring-ring',
                            invalid && 'border-destructive',
                            className
                        )}
                    >
                        {selecionados.length === 0 ? (
                            <span className="min-w-0 flex-1 truncate text-left text-muted-foreground">{placeholder}</span>
                        ) : (
                            <div ref={chipsRef} className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden">
                                {exibidos.map((option) => (
                                    <Tooltip key={option.value}>
                                        <TooltipTrigger asChild>
                                            <span className={cn(CHIP_CLASS, 'pr-1', exibidos.length === 1 ? 'min-w-0 shrink' : 'shrink-0')}>
                                                <span className="max-w-[10rem] truncate">{option.label}</span>
                                                <AcaoInterna
                                                    label={`Remover ${option.label}`}
                                                    onAcionar={() => alternar(option.value)}
                                                    className="text-muted-foreground hover:text-destructive"
                                                >
                                                    <X className="h-3 w-3" />
                                                </AcaoInterna>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">{option.label}</TooltipContent>
                                    </Tooltip>
                                ))}
                                {ocultos.length > 0 && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className={cn(CHIP_CLASS, 'shrink-0')}>+{ocultos.length}</span>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <ul className="flex flex-col gap-0.5">
                                                {ocultos.map((option) => (
                                                    <li key={option.value}>{option.label}</li>
                                                ))}
                                            </ul>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        )}
                        <span className="flex shrink-0 items-center gap-1">
                            {selecionados.length > 0 && !disabled && (
                                <AcaoInterna
                                    label="Limpar seleção"
                                    onAcionar={() => onValueChange([])}
                                    className="p-0.5 opacity-50 hover:bg-muted hover:opacity-100"
                                >
                                    <X className="h-4 w-4" />
                                </AcaoInterna>
                            )}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </span>
                    </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] min-w-[16rem] p-0">
                    <div className="flex items-center gap-1 border-b border-border bg-muted/30 px-2 py-1.5">
                        <button
                            type="button"
                            onClick={() => emitir(options.map((option) => option.value))}
                            disabled={selecionados.length === options.length}
                            className="h-7 flex-1 rounded-sm text-xs font-medium hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                        >
                            Selecionar todos
                        </button>
                        <button
                            type="button"
                            onClick={() => onValueChange([])}
                            disabled={selecionados.length === 0}
                            className="h-7 flex-1 rounded-sm text-xs font-medium hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
                        >
                            Limpar seleção
                        </button>
                    </div>
                    <div ref={listRef} className="max-h-72 overflow-y-auto p-1">
                        {options.map((option) => (
                            <label
                                key={option.value}
                                className="flex w-full cursor-pointer select-none items-center gap-2.5 rounded-sm px-2 py-2.5 text-base hover:bg-accent hover:text-accent-foreground sm:py-1.5 sm:text-sm"
                            >
                                <Checkbox checked={value.includes(option.value)} onCheckedChange={() => alternar(option.value)} />
                                <span className="truncate">{option.label}</span>
                            </label>
                        ))}
                    </div>
                    <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                        {selecionados.length} de {options.length} selecionados
                    </p>
                </PopoverContent>
            </Popover>
        </TooltipProvider>
    )
}

export { MultiSelect }
