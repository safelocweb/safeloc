'use client'

import { useQuery } from '@tanstack/react-query'
import { FileSearch, Gauge, MessageSquareWarning, Search, TrendingUp } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { dashboardService, StatusContestacaoEfetivo } from '@/app/services/dashboard.service'
import {
    GRAVIDADE_OCORRENCIA_CHART_COLOR,
    GRAVIDADE_OCORRENCIA_LABEL,
    GRAVIDADE_OCORRENCIA_OPTIONS
} from '@/shared/constants/gravidade-ocorrencia'
import { STATUS_CONTESTACAO_LABEL } from '@/shared/constants/status-contestacao'

const ORDEM_STATUS_CONTESTACAO: StatusContestacaoEfetivo[] = [
    'ABERTA',
    'RESPONDIDA',
    'PROCEDENTE',
    'IMPROCEDENTE',
    'EXPIRADA'
]

function formatarMes(mes: string) {
    const [ano, mesNumero] = mes.split('-').map(Number)
    const data = new Date(ano, mesNumero - 1, 1)
    const label = data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
    return label.charAt(0).toUpperCase() + label.slice(1)
}

function formatarMesTooltip(label: React.ReactNode) {
    return typeof label === 'string' ? formatarMes(label) : label
}

function formatarValorTooltip(nomeSerie: string) {
    return (value: unknown): [string, string] => [
        typeof value === 'number' ? value.toLocaleString('pt-BR') : String(value ?? ''),
        nomeSerie
    ]
}

function StatCard({
    icon: Icon,
    label,
    value
}: {
    icon: React.ElementType
    label: string
    value: number
}) {
    return (
        <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-xs leading-tight text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold tabular-nums text-foreground">
                        {value.toLocaleString('pt-BR')}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-[76px] w-full" />
                <Skeleton className="h-[76px] w-full" />
                <Skeleton className="h-[76px] w-full" />
            </div>
            <Skeleton className="h-60 w-full" />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Skeleton className="h-48 w-full lg:col-span-2" />
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    )
}

function DashboardPage() {
    const { data: resumo, isLoading } = useQuery({
        queryKey: ['dashboard-resumo'],
        queryFn: () => dashboardService.resumo()
    })

    if (isLoading || !resumo) {
        return <DashboardSkeleton />
    }

    const totalContestacoes = ORDEM_STATUS_CONTESTACAO.reduce(
        (total, status) => total + resumo.contestacoesPorStatus[status],
        0
    )

    const totalGravidade = GRAVIDADE_OCORRENCIA_OPTIONS.reduce(
        (total, option) => total + resumo.distribuicaoGravidade[option.value],
        0
    )
    const gravidadeChartData = GRAVIDADE_OCORRENCIA_OPTIONS.map((option) => ({
        name: GRAVIDADE_OCORRENCIA_LABEL[option.value],
        value: resumo.distribuicaoGravidade[option.value],
        color: GRAVIDADE_OCORRENCIA_CHART_COLOR[option.value]
    }))
    const contestacaoChartData = ORDEM_STATUS_CONTESTACAO.map((status) => ({
        name: STATUS_CONTESTACAO_LABEL[status],
        total: resumo.contestacoesPorStatus[status]
    }))

    return (
        <div className="flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/15 via-card to-blue-500/10 p-6 shadow-sm">
                <div className="absolute -right-10 -top-14 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
                <div className="relative">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary"><TrendingUp className="h-4 w-4" />Painel estratégico</div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Visão geral da sua operação</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                    Visão geral dos registros e consultas da sua imobiliária
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard icon={FileSearch} label="Ocorrências registradas" value={resumo.totalOcorrenciasImobiliaria} />
                <StatCard icon={Search} label="Consultas realizadas" value={resumo.totalConsultasImobiliaria} />
                <StatCard icon={MessageSquareWarning} label="Contestações recebidas" value={totalContestacoes} />
            </div>

            <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
                <CardHeader className="px-6 py-4">
                    <CardTitle>Registros da sua imobiliária</CardTitle>
                    <CardDescription>Ocorrências inseridas nos últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent className="h-52 pt-0 sm:h-60">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={resumo.serieMensalImobiliaria}
                            margin={{ top: 16, right: 16, bottom: 0, left: -16 }}
                        >
                            <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                            <XAxis
                                dataKey="mes"
                                tickFormatter={formatarMes}
                                tickLine={false}
                                axisLine={false}
                                fontSize={12}
                                stroke="hsl(var(--muted-foreground))"
                            />
                            <YAxis
                                allowDecimals={false}
                                domain={[0, 'dataMax + 2']}
                                tickLine={false}
                                axisLine={false}
                                fontSize={12}
                                stroke="hsl(var(--muted-foreground))"
                            />
                            <Tooltip
                                labelFormatter={formatarMesTooltip}
                                formatter={formatarValorTooltip('Ocorrências')}
                                cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                                allowEscapeViewBox={{ x: false, y: false }}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--popover))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 8,
                                    fontSize: 12
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="var(--chart-blue)"
                                strokeWidth={2}
                                fill="var(--chart-blue)"
                                fillOpacity={0.1}
                                dot={(dotProps: {
                                    cx?: number
                                    cy?: number
                                    index?: number
                                    key?: React.Key | null
                                }) => {
                                    const { cx, cy, index, key } = dotProps
                                    const ultimoIndice = resumo.serieMensalImobiliaria.length - 1
                                    if (cx === undefined || cy === undefined || index !== ultimoIndice) {
                                        return <g key={key ?? index} />
                                    }
                                    return (
                                        <circle
                                            key={key ?? index}
                                            cx={cx}
                                            cy={cy}
                                            r={5}
                                            fill="var(--chart-blue)"
                                            stroke="hsl(var(--card))"
                                            strokeWidth={2}
                                        />
                                    )
                                }}
                                activeDot={{ r: 5, fill: 'var(--chart-blue)', stroke: 'hsl(var(--card))', strokeWidth: 2 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card className="flex flex-col border-border/70 bg-card/95 shadow-sm">
                    <CardHeader className="px-6 py-4">
                        <CardTitle>Distribuição por gravidade</CardTitle>
                        <CardDescription>Ocorrências ativas da sua imobiliária, por gravidade</CardDescription>
                    </CardHeader>
                    <CardContent className="flex min-h-64 flex-1 items-center justify-center pt-0">
                        {totalGravidade === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-10">
                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                    <Gauge className="h-7 w-7 text-muted-foreground" />
                                </span>
                                <p className="max-w-xs text-center text-sm text-muted-foreground">
                                    Nenhuma ocorrência registrada ainda.
                                </p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={gravidadeChartData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="82%" paddingAngle={4}>{gravidadeChartData.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={formatarValorTooltip('Ocorrências')} contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} /></PieChart></ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card className="flex flex-col border-border/70 bg-card/95 shadow-sm">
                    <CardHeader className="px-6 py-4">
                        <CardTitle>Contestações por status</CardTitle>
                        <CardDescription>Total: {totalContestacoes.toLocaleString('pt-BR')}</CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-64 pt-0">
                        {totalContestacoes === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-10">
                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                                    <MessageSquareWarning className="h-7 w-7 text-muted-foreground" />
                                </span>
                                <p className="max-w-xs text-center text-sm text-muted-foreground">
                                    Nenhuma contestação registrada.
                                </p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%"><BarChart data={contestacaoChartData} layout="vertical" margin={{ left: 18 }}><XAxis type="number" allowDecimals={false} hide /><YAxis type="category" dataKey="name" width={94} tickLine={false} axisLine={false} fontSize={11} stroke="hsl(var(--muted-foreground))" /><Tooltip formatter={formatarValorTooltip('Contestações')} cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} /><Bar dataKey="total" fill="var(--chart-blue)" radius={[0, 6, 6, 0]} /></BarChart></ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default DashboardPage
