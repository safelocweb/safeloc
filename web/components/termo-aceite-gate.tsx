'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { authService } from '@/app/services/auth.service'
import { useUser } from '@/app/providers/user-provider'
import { getErrorMessage } from '@/lib/get-error-message'
import { ROUTES } from '@/shared/enums/routes.enum'

const DECLARACOES = [
    'Utilizarei a plataforma exclusivamente para fins legítimos relacionados à análise e gestão de locações imobiliárias.',
    'Estou ciente de que todas as consultas, registros, alterações e encerramentos realizados por mim serão registrados, auditados e vinculados ao meu usuário.',
    'Declaro que todas as informações inseridas na plataforma serão verdadeiras, verificáveis e de responsabilidade exclusiva da imobiliária que represento.',
    'Comprometo-me a não inserir informações falsas, ofensivas, discriminatórias ou sem relação direta com a locação imobiliária.',
    'Estou ciente de que o compartilhamento indevido de acesso ou senha é proibido e poderá gerar bloqueio do usuário e responsabilização da imobiliária.',
    'Reconheço que a Safeloc atua exclusivamente como provedora da plataforma tecnológica, não sendo responsável pela veracidade das informações registradas pelos usuários.',
    'Declaro ter lido e aceitado os Termos de Uso e a Política de Privacidade da plataforma.'
]

export function TermoAceiteGate() {
    const { recarregar } = useUser()
    const [processando, setProcessando] = useState<'aceitar' | 'recusar' | null>(null)

    async function aceitar() {
        setProcessando('aceitar')
        try {
            await authService.aceitarTermo()
            await recarregar()
        } catch (error) {
            toast.error(getErrorMessage(error, 'Não foi possível registrar o aceite. Tente novamente.'))
            setProcessando(null)
        }
    }

    async function recusar() {
        setProcessando('recusar')
        await authService.logout()
        window.location.href = ROUTES.LOGIN
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background p-4">
            <Card className="my-8 w-full max-w-xl shadow-xl shadow-black/5">
                <CardHeader className="items-center text-center">
                    <Image
                        src="/logo.png"
                        alt="Safeloc"
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-xl shadow-lg shadow-primary/25"
                    />
                    <CardTitle>Termo de Aceite – Primeiro Acesso</CardTitle>
                    <CardDescription>Declaração de Responsabilidade e Uso da Plataforma</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                    <p className="text-sm text-muted-foreground">Ao acessar a plataforma Safeloc, declaro que:</p>

                    <ul className="flex flex-col gap-3">
                        {DECLARACOES.map((texto) => (
                            <li key={texto} className="flex items-start gap-2.5 text-sm text-foreground">
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span>{texto}</span>
                            </li>
                        ))}
                    </ul>

                    <p className="text-xs text-muted-foreground">
                        Leia os{' '}
                        <Link href={ROUTES.TERMOS_USO} target="_blank" className="text-primary hover:underline">
                            Termos de Uso
                        </Link>{' '}
                        e a{' '}
                        <Link
                            href={ROUTES.POLITICA_PRIVACIDADE}
                            target="_blank"
                            className="text-primary hover:underline"
                        >
                            Política de Privacidade
                        </Link>{' '}
                        da plataforma.
                    </p>

                    <div className="flex flex-col gap-2 sm:flex-row-reverse">
                        <Button className="flex-1" disabled={processando !== null} onClick={aceitar}>
                            {processando === 'aceitar' && <Loader2 className="h-4 w-4 animate-spin" />}
                            Aceito e desejo continuar
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            disabled={processando !== null}
                            onClick={recusar}
                        >
                            Não aceito
                        </Button>
                    </div>

                    <p className="text-center text-2xs leading-relaxed text-muted-foreground">
                        O aceite deste termo será armazenado juntamente com a data, horário, IP e identificação do
                        usuário.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
