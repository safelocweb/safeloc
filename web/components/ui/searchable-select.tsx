'use client'

import * as React from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNonPassiveWheelScroll } from '@/lib/use-non-passive-wheel-scroll'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface SearchableSelectOption {
    value: string
    label: string
}

interface SearchableSelectProps {
    id?: string
    options: SearchableSelectOption[]
    value?: string
    onValueChange: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    disabled?: boolean
    className?: string
}

const SearchableSelect = ({
    id,
    options,
    value,
    onValueChange,
    placeholder = 'Selecione...',
    searchPlaceholder = 'Buscar...',
    emptyMessage = 'Nenhum resultado encontrado.',
    disabled,
    className
}: SearchableSelectProps) => {
    const [open, setOpen] = React.useState(false)
    const [busca, setBusca] = React.useState('')
    const listRef = useNonPassiveWheelScroll<HTMLDivElement>()

    const selecionado = options.find((option) => option.value === value)

    const opcoesFiltradas = React.useMemo(() => {
        const termo = busca.trim().toLowerCase()
        if (!termo) return options
        return options.filter((option) => option.label.toLowerCase().includes(termo))
    }, [options, busca])

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next)
                if (!next) setBusca('')
            }}
        >
            <PopoverTrigger asChild>
                <button
                    id={id}
                    type="button"
                    disabled={disabled}
                    className={cn(
                        'flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base sm:h-10 sm:text-sm',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'focus:outline-none focus:ring-2 focus:ring-ring',
                        className
                    )}
                >
                    <span className={cn('min-w-0 flex-1 truncate text-left', !selecionado && 'text-muted-foreground')}>
                        {selecionado?.label ?? placeholder}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] p-0"
                onOpenAutoFocus={(event) => event.preventDefault()}
            >
                <div className="flex items-center gap-2 border-b border-border px-3">
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                        autoFocus
                        value={busca}
                        onChange={(event) => setBusca(event.target.value)}
                        placeholder={searchPlaceholder}
                        className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                </div>
                <div ref={listRef} className="max-h-64 overflow-y-auto p-1">
                    {opcoesFiltradas.length === 0 && (
                        <p className="px-2 py-3 text-center text-sm text-muted-foreground">{emptyMessage}</p>
                    )}
                    {opcoesFiltradas.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onValueChange(option.value)
                                setOpen(false)
                                setBusca('')
                            }}
                            className={cn(
                                'relative flex w-full cursor-pointer select-none items-center rounded-sm py-2.5 pl-8 pr-2 text-left text-base outline-none sm:py-1.5 sm:text-sm',
                                'hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <span className="absolute left-2 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center">
                                {option.value === value && <Check className="h-4 w-4" />}
                            </span>
                            {option.label}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}

export { SearchableSelect }
