import Link from 'next/link'
import { ROUTES } from '@/shared/enums/routes.enum'

export function AppFooter() {
    return (
        <footer className="shrink-0 border-t border-white/25 py-3 text-center text-[11px] leading-4 text-white/85 [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
                <Link
                    href={ROUTES.TERMOS_USO}
                    target="_blank"
                    className="transition-colors hover:text-white hover:underline"
                >
                    Termos de Uso
                </Link>
                <Link
                    href={ROUTES.POLITICA_PRIVACIDADE}
                    target="_blank"
                    className="transition-colors hover:text-white hover:underline"
                >
                    Política de Privacidade
                </Link>
                <a
                    href="mailto:contato@safeloc.com.br"
                    className="transition-colors hover:text-white hover:underline"
                >
                    Contato
                </a>
                <span>© {new Date().getFullYear()} Safeloc</span>
            </div>
        </footer>
    )
}
