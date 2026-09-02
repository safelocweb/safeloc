import { LoginBackground } from '@/components/login-background'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(200_42%_9%)] p-4 sm:p-6">
            <LoginBackground />

            <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6">{children}</div>
        </main>
    )
}
