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
        <div className="flex min-h-dvh flex-col bg-background md:h-dvh md:overflow-hidden">
            <header className="sticky top-0 z-30 flex h-16 shrink-0 items-stretch border-b border-border bg-topbar shadow-sm">
                {!usuarioPadrao && (
                    <button
                        onClick={() => setMenuAberto(true)}
                        aria-label="Abrir menu"
                        className="ml-4 inline-flex shrink-0 items-center justify-center self-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                )}

                <div className="flex min-w-0 items-center gap-3 px-4 md:w-64 md:shrink-0 md:px-5">
                    <Image src="/logo.png" alt="Safeloc" width={40} height={40} className="h-9 w-9 rounded-lg md:h-10 md:w-10" />
                    <div className="min-w-0 leading-tight">
                        <p className="truncate text-lg font-bold tracking-tight">
                            Safe<span className="text-primary">Loc</span>
                        </p>
                        <p className="hidden truncate text-[11px] text-muted-foreground sm:block">Consulta de Inquilinos</p>
                    </div>
                </div>

                <div className="flex min-w-0 flex-1 items-center gap-2 px-4 sm:px-6 lg:px-8">
                    <div className="hidden flex-1 md:block">
                        <p className="truncate text-base text-muted-foreground">
                            {getSaudacao()}, <span className="font-semibold text-foreground">{usuario.nomeCompleto}</span>
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

            <div className="flex min-h-0 flex-1">
                {!usuarioPadrao && (
                    <aside className="relative hidden shrink-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground md:flex md:w-64">
                        <ShieldCheck
                            aria-hidden
                            strokeWidth={1.25}
                            className="pointer-events-none absolute -bottom-10 -left-14 h-64 w-64 text-sidebar-foreground/[0.04]"
                        />

                        <nav className="relative flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
                            <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-sidebar-muted">
                                Navegação
                            </p>
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const ativo = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                                            ativo
                                                ? 'bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/25'
                                                : 'text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                                        )}
                                    >
                                        <Icon className="h-[18px] w-[18px] shrink-0" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </nav>

                        <div className="relative shrink-0 px-4 py-4 text-center">
                            <p className="text-xs leading-4 text-sidebar-muted">v{APP_VERSION}</p>
                        </div>
                    </aside>
                )}

                <div className="app-photo-bg relative flex min-w-0 flex-1 flex-col md:min-h-0 md:overflow-hidden">
                    <div aria-hidden className="pointer-events-none absolute inset-0 hidden bg-topbar/70 dark:block" />

                    <div
                        aria-hidden
                        className="pointer-events-none absolute bottom-16 right-10 hidden flex-col items-start gap-3 text-white xl:flex"
                    >
                        <svg viewBox="0 0 420 220" className="absolute -bottom-16 -right-10 h-56 w-[420px] text-primary" fill="none">
                            <path d="M0 220 C 140 200, 300 120, 420 20" stroke="currentColor" strokeWidth="2" opacity="0.8" />
                        </svg>
                        <ShieldCheck className="relative ml-28 h-14 w-14 text-primary drop-shadow-lg" strokeWidth={1.75} />
                        <p className="relative text-xl font-semibold leading-snug [text-shadow:0_2px_8px_rgb(0_0_0/0.6)]">
                            Mais segurança
                            <br />
                            para o seu negócio
                        </p>
                        <span className="relative h-1 w-16 rounded-full bg-primary" />
                    </div>

                    <main className="relative flex w-full flex-1 flex-col px-4 sm:px-6 md:min-h-0 lg:px-8">
                        {/* Rolagem fica só no conteúdo; páginas com h-full usam a altura disponível e rolam internamente */}
                        <div className="-mx-4 flex-1 px-4 pb-8 pt-6 sm:-mx-6 sm:px-6 sm:pt-8 md:min-h-0 md:overflow-y-auto lg:-mx-8 lg:px-8">
                            {children}
                        </div>
                        <AppFooter />
                        {usuarioPadrao && (
                            <p className="shrink-0 pb-2 text-center text-xs leading-4 text-white/85 [text-shadow:0_1px_4px_rgb(0_0_0/0.7)]">
                                v{APP_VERSION}
                            </p>
                        )}
                    </main>
                </div>
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
