'use client'

import { useQuery } from '@tanstack/react-query'
import { FileSearch, Gauge, MessageSquareWarning, Search } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { dashboardService, StatusContestacaoEfetivo } from '@/app/services/dashboard.service'
import {
    GRAVIDADE_OCORRENCIA_CHART_COLOR,
    GRAVIDADE_OCORRENCIA_LABEL,
    GRAVIDADE_OCORRENCIA_OPTIONS
} from '@/shared/constants/gravidade-ocorrencia'
import { STATUS_CONTESTACAO_DOT_CLASSNAME, STATUS_CONTESTACAO_LABEL } from '@/shared/constants/status-contestacao'

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
        <Card>
            <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                    <p className="text-xs leading-tight text-muted-foreground">{label}</p>
                    <p className="text-xl font-semibold tabular-nums text-foreground">
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

    return (
        <div className="flex flex-col gap-5">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Visão geral dos registros e consultas da sua imobiliária
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard icon={FileSearch} label="Ocorrências registradas" value={resumo.totalOcorrenciasImobiliaria} />
                <StatCard icon={Search} label="Consultas realizadas" value={resumo.totalConsultasImobiliaria} />
                <StatCard icon={MessageSquareWarning} label="Contestações recebidas" value={totalContestacoes} />
            </div>

            <Card>
                <CardHeader className="px-6 py-4">
                    <CardTitle>Registros da sua imobiliária</CardTitle>
                    <CardDescription>Ocorrências inseridas nos últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent className="h-44 pt-0 sm:h-52">
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

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-4">
                <Card className="flex flex-col lg:col-span-2">
                    <CardHeader className="px-6 py-4">
                        <CardTitle>Distribuição por gravidade</CardTitle>
                        <CardDescription>Ocorrências ativas da sua imobiliária, por gravidade</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-center gap-5 pt-0">
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
                            <ul className="flex flex-col gap-5">
                                {GRAVIDADE_OCORRENCIA_OPTIONS.map((option) => {
                                    const quantidade = resumo.distribuicaoGravidade[option.value]
                                    const percentual = totalGravidade > 0 ? (quantidade / totalGravidade) * 100 : 0
                                    return (
                                        <li key={option.value} className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2 text-muted-foreground">
                                                    <span
                                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                        style={{ backgroundColor: GRAVIDADE_OCORRENCIA_CHART_COLOR[option.value] }}
                                                    />
                                                    {GRAVIDADE_OCORRENCIA_LABEL[option.value]}
                                                </span>
                                                <span className="font-medium tabular-nums text-foreground">
                                                    {quantidade.toLocaleString('pt-BR')}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{
                                                        width: `${percentual}%`,
                                                        backgroundColor: GRAVIDADE_OCORRENCIA_CHART_COLOR[option.value]
                                                    }}
                                                />
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader className="px-6 py-4">
                        <CardTitle>Contestações por status</CardTitle>
                        <CardDescription>Total: {totalContestacoes.toLocaleString('pt-BR')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-center gap-4 pt-0">
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
                            <ul className="flex flex-col gap-4">
                                {ORDEM_STATUS_CONTESTACAO.map((status) => (
                                    <li key={status} className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <span
                                                className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_CONTESTACAO_DOT_CLASSNAME[status]}`}
                                            />
                                            {STATUS_CONTESTACAO_LABEL[status]}
                                        </span>
                                        <span className="font-medium tabular-nums text-foreground">
                                            {resumo.contestacoesPorStatus[status].toLocaleString('pt-BR')}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default DashboardPage
