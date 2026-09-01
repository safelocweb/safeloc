import { useCallback, useRef } from 'react'

const EASING = 0.22

/**
 * Rolagem suave e consistente para listas de dropdown (Select, SearchableSelect,
 * notificações), independente do dispositivo (mouse com roda "aos pulos" ou
 * trackpad) e do contexto (dentro ou fora de um Dialog).
 *
 * Acumula o delta de cada wheel num alvo e anima o `scrollTop` até ele por
 * interpolação a cada frame — em vez de aplicar o delta bruto de uma vez, que fica
 * "aos trancos" num mouse comum, ou depender do scroll nativo do navegador, que o
 * react-remove-scroll do Radix Dialog bloqueia para conteúdo portalizado (Select e
 * SearchableSelect renderizam fora da árvore DOM do dialog).
 *
 * Usa callback ref (em vez de useRef + useEffect) porque o elemento é desmontado e
 * remontado pelo Radix a cada abertura/fechamento (Popover/Select content só existe
 * no DOM enquanto aberto) — um efeito com deps vazias só rodaria na primeira
 * montagem do componente e nunca reanexaria o listener nas aberturas seguintes.
 */
export function useNonPassiveWheelScroll<T extends HTMLElement>() {
    const cleanupRef = useRef<(() => void) | null>(null)

    return useCallback((el: T | null) => {
        cleanupRef.current?.()
        cleanupRef.current = null

        if (!el) return

        let target = el.scrollTop
        let rafId: number | null = null

        function step() {
            const current = el!.scrollTop
            const diff = target - current
            if (Math.abs(diff) < 0.5) {
                el!.scrollTop = target
                rafId = null
                return
            }
            el!.scrollTop = current + diff * EASING
            rafId = requestAnimationFrame(step)
        }

        function handleWheel(event: WheelEvent) {
            const max = el!.scrollHeight - el!.clientHeight
            // Sem conteúdo pra rolar (ex.: listas curtas como Situação atual, Faixa
            // de valor, Gravidade) — não intercepta, deixa o wheel seguir seu
            // comportamento normal (ex.: rolar a página atrás do dropdown).
            if (max <= 0) return

            event.preventDefault()
            target = Math.min(max, Math.max(0, target + event.deltaY))
            if (rafId === null) rafId = requestAnimationFrame(step)
        }

        el.addEventListener('wheel', handleWheel, { passive: false })
        cleanupRef.current = () => {
            el.removeEventListener('wheel', handleWheel)
            if (rafId !== null) cancelAnimationFrame(rafId)
        }
    }, [])
}
