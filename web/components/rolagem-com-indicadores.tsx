'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const TOLERANCIA_PX = 4

interface RolagemComIndicadoresProps {
    className?: string
    rotuloAbaixo?: string
    children: React.ReactNode
}

// Área com rolagem interna que avisa visualmente quando há conteúdo escondido acima ou abaixo
export function RolagemComIndicadores({
    className,
    rotuloAbaixo = 'Role para ver mais',
    children
}: RolagemComIndicadoresProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [temAcima, setTemAcima] = useState(false)
    const [temAbaixo, setTemAbaixo] = useState(false)

    useEffect(() => {
        const elemento = ref.current
        if (!elemento) return

        function atualizar() {
            if (!elemento) return
            setTemAcima(elemento.scrollTop > TOLERANCIA_PX)
            setTemAbaixo(elemento.scrollTop + elemento.clientHeight < elemento.scrollHeight - TOLERANCIA_PX)
        }

        atualizar()
        elemento.addEventListener('scroll', atualizar, { passive: true })

        const resizeObserver = new ResizeObserver(atualizar)
        resizeObserver.observe(elemento)

        // Conteúdo carregado depois (ex.: detalhes da consulta) muda o scrollHeight sem redimensionar o container
        const mutationObserver = new MutationObserver(atualizar)
        mutationObserver.observe(elemento, { childList: true, subtree: true })

        return () => {
            elemento.removeEventListener('scroll', atualizar)
            resizeObserver.disconnect()
            mutationObserver.disconnect()
        }
    }, [])

    function rolarParaBaixo() {
        const elemento = ref.current
        if (!elemento) return
        elemento.scrollBy({ top: elemento.clientHeight * 0.8, behavior: 'smooth' })
    }

    function voltarAoTopo() {
        ref.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="relative flex-1 md:min-h-0">
            <div ref={ref} className={className}>
                {children}
            </div>

            <div
                aria-hidden
                className={cn(
                    'pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-card to-transparent transition-opacity duration-200',
                    temAcima ? 'opacity-100' : 'opacity-0'
                )}
            />
            <button
                type="button"
                onClick={voltarAoTopo}
                tabIndex={temAcima ? 0 : -1}
                className={cn(
                    'absolute left-1/2 top-2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-card/95 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-md backdrop-blur transition-all duration-200 hover:text-foreground',
                    temAcima ? 'opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
                )}
            >
                <ChevronUp className="h-3.5 w-3.5" />
                Voltar ao topo
            </button>

            <div
                aria-hidden
                className={cn(
                    'pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card via-card/80 to-transparent transition-opacity duration-200',
                    temAbaixo ? 'opacity-100' : 'opacity-0'
                )}
            />
            <button
                type="button"
                onClick={rolarParaBaixo}
                tabIndex={temAbaixo ? 0 : -1}
                className={cn(
                    'absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:bg-primary/90',
                    temAbaixo ? 'opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
                )}
            >
                <ChevronDown className="h-3.5 w-3.5" />
                {rotuloAbaixo}
            </button>
        </div>
    )
}
