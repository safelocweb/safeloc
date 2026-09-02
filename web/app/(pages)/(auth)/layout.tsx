'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    Menu,
    LayoutDashboard,
    Search,
    PlusCircle,
    Trash2,
    Users,
    MessageSquareWarning,
    ShieldCheck,
    LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppFooter } from '@/components/app-footer'
import { AppLoading } from '@/components/app-loading'
import { MobileNavDrawer } from '@/components/mobile-nav-drawer'
import { NotificacaoSino } from '@/components/notificacao-sino'
import { TermoAceiteGate } from '@/components/termo-aceite-gate'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useUser } from '@/app/providers/user-provider'
import { authService } from '@/app/services/auth.service'
import { APP_VERSION } from '@/shared/constants/versao'
import { ROUTES } from '@/shared/enums/routes.enum'

const NAV_ITEMS = [
    { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { href: ROUTES.CONSULTAR, label: 'Consultar Ocorrências', icon: Search },
    { href: ROUTES.INSERIR, label: 'Inserir Ocorrências', icon: PlusCircle },
    { href: ROUTES.EXCLUIR, label: 'Excluir Ocorrências', icon: Trash2 },
    { href: ROUTES.USUARIOS, label: 'Usuários', icon: Users },
    { href: ROUTES.CONTESTACAO, label: 'Contestação', icon: MessageSquareWarning }
]

const NAV_ITEMS_PADRAO = [{ href: ROUTES.CONSULTAR, label: 'Consultar Ocorrências', icon: Search }]

function getSaudacao() {
    const minutosDoDia = new Date().getHours() * 60 + new Date().getMinutes()

    if (minutosDoDia < 4 * 60 + 30 || minutosDoDia >= 18 * 60) return 'Boa noite'
    if (minutosDoDia < 12 * 60) return 'Bom dia'
    return 'Boa tarde'
}

const ADMIN_NAV_ITEM = {
    href: ROUTES.ADMINISTRADOR,
    label: 'Administrador',
    icon: ShieldCheck
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const { usuario, carregando } = useUser()
    const router = useRouter()
    const pathname = usePathname()
    const [menuAberto, setMenuAberto] = useState(false)

    useEffect(() => {
        if (!carregando && !usuario) {
            router.replace(`${ROUTES.LOGIN}?returnTo=${encodeURIComponent(pathname)}`)
        }
    }, [carregando, usuario, pathname, router])

    useEffect(() => {
        setMenuAberto(false)
    }, [pathname])

    if (carregando || !usuario) {
        return <AppLoading />
    }

    if (!usuario.termoAceito) {
        return <TermoAceiteGate />
    }

    async function sair() {
        await authService.logout()
        window.location.href = ROUTES.LOGIN
    }

    const usuarioPadrao = usuario.role === 'IMOBILIARIA' && usuario.papel === 'PADRAO'

    const navItems = usuario.role === 'MASTER' ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : usuarioPadrao ? NAV_ITEMS_PADRAO : NAV_ITEMS

    return (
        <div className="app-shell-grid flex min-h-dvh bg-background md:h-dvh md:overflow-hidden">
            {!usuarioPadrao && (
                <aside className="hidden shrink-0 flex-col border-r border-border bg-card/95 shadow-xl shadow-black/5 backdrop-blur md:flex md:w-64">
                    <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-4">
                        <Image src="/logo.png" alt="Safeloc" width={36} height={36} className="h-9 w-9 rounded-lg" />
                        <p className="text-sm font-bold tracking-tight">
                            Safe<span className="text-primary">loc</span>
                        </p>
                    </div>

                    <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3">
                        <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Navegação</p>
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const ativo = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                                        ativo
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    )}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="shrink-0 border-t border-border px-4 py-3 text-center">
                        <p className="text-xs leading-4 text-muted-foreground">v{APP_VERSION}</p>
                    </div>
                </aside>
            )}

            <div className="flex min-w-0 flex-1 flex-col md:min-h-0 md:overflow-hidden">
                <header className="sticky top-0 z-30 flex h-16 shrink-0 items-stretch border-b border-border bg-card/90 backdrop-blur-xl">
                    {!usuarioPadrao && (
                        <button
                            onClick={() => setMenuAberto(true)}
                            aria-label="Abrir menu"
                            className="ml-4 inline-flex shrink-0 items-center justify-center self-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    )}

                    <div
                        className={cn(
                            'flex min-w-0 items-center gap-2 px-4',
                            usuarioPadrao ? 'md:h-16 md:w-64 md:shrink-0 md:border-r md:border-border' : 'md:hidden'
                        )}
                    >
                        <Image
                            src="/logo.png"
                            alt="Safeloc"
                            width={36}
                            height={36}
                            className={cn('rounded-lg', usuarioPadrao ? 'h-8 w-8 md:h-9 md:w-9' : 'h-8 w-8')}
                        />
                        <p className="truncate text-sm font-bold tracking-tight">
                            Safe<span className="text-primary">loc</span>
                        </p>
                    </div>

                    <div className="flex min-w-0 flex-1 items-center gap-2 px-4 sm:px-6 lg:px-8">
                        <div className="hidden flex-1 md:block">
                            <p className="truncate text-base text-muted-foreground">
                                {getSaudacao()},{' '}
                                <span className="font-medium text-foreground">{usuario.nomeCompleto}</span>
                            </p>
                        </div>

                        <div className="ml-auto flex shrink-0 items-center gap-1">
                            <NotificacaoSino />
                            <ThemeToggle compact />
                            <button
                                onClick={sair}
                                title="Sair"
                                aria-label="Sair"
                                className="inline-flex shrink-0 items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex w-full flex-1 flex-col px-4 pt-6 sm:px-6 sm:pt-8 md:min-h-0 md:overflow-y-auto lg:px-8">
                    <div className="flex-1 pb-8">{children}</div>
                    <AppFooter />
                    {usuarioPadrao && (
                        <p className="shrink-0 pb-2 text-center text-xs leading-4 text-muted-foreground">
                            v{APP_VERSION}
                        </p>
                    )}
                </main>
            </div>

            {!usuarioPadrao && (
                <MobileNavDrawer
                    open={menuAberto}
                    onOpenChange={setMenuAberto}
                    navItems={navItems}
                    nomeUsuario={usuario.nomeCompleto}
                />
            )}
        </div>
    )
}
