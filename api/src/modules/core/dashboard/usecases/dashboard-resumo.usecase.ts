import { Injectable } from '@nestjs/common'
import { GravidadeOcorrencia } from '@prisma/client'
import prisma from '../../../../infra/persistence/prisma'
import { calcularStatusEfetivo, StatusContestacaoEfetivo } from '../../contestacao/utils/calcular-status-efetivo'

export interface SerieMensalPonto {
    mes: string
    total: number
}

export interface DashboardResumo {
    totalOcorrenciasImobiliaria: number
    totalConsultasImobiliaria: number
    contestacoesPorStatus: Record<StatusContestacaoEfetivo, number>
    distribuicaoGravidade: Record<GravidadeOcorrencia, number>
    serieMensalImobiliaria: SerieMensalPonto[]
}

const MESES_JANELA = 6
const STATUS_CONTESTACAO_INICIAL: Record<StatusContestacaoEfetivo, number> = {
    ABERTA: 0,
    RESPONDIDA: 0,
    PROCEDENTE: 0,
    IMPROCEDENTE: 0,
    EXPIRADA: 0
}
const GRAVIDADE_INICIAL: Record<GravidadeOcorrencia, number> = {
    BAIXA: 0,
    MEDIA: 0,
    ALTA: 0
}

function inicioDaJanela(): Date {
    const data = new Date()
    data.setHours(0, 0, 0, 0)
    data.setDate(1)
    data.setMonth(data.getMonth() - (MESES_JANELA - 1))
    return data
}

function chaveMes(data: Date): string {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
}

function serieMensalVazia(): SerieMensalPonto[] {
    const inicio = inicioDaJanela()
    return Array.from({ length: MESES_JANELA }, (_, indice) => {
        const data = new Date(inicio)
        data.setMonth(data.getMonth() + indice)
        return { mes: chaveMes(data), total: 0 }
    })
}

function agruparPorMes(datas: Date[]): SerieMensalPonto[] {
    const serie = serieMensalVazia()
    const contagemPorMes = new Map(serie.map((ponto) => [ponto.mes, 0]))

    for (const data of datas) {
        const chave = chaveMes(data)
        if (contagemPorMes.has(chave)) {
            contagemPorMes.set(chave, (contagemPorMes.get(chave) ?? 0) + 1)
        }
    }

    return serie.map((ponto) => ({ mes: ponto.mes, total: contagemPorMes.get(ponto.mes) ?? 0 }))
}

@Injectable()
export class DashboardResumoUsecase {
    async execute(imobiliariaId: number): Promise<DashboardResumo> {
        const inicio = inicioDaJanela()

        const [totalOcorrenciasImobiliaria, totalConsultasImobiliaria, contestacoes, distribuicaoGravidadeRaw, ocorrenciasImobiliaria] =
            await Promise.all([
                prisma.ocorrencia.count({ where: { imobiliariaId, status: 'ATIVA' } }),
                prisma.auditLog.count({ where: { imobiliariaId, acao: 'CONSULTA_CPF' } }),
                prisma.contestacao.findMany({
                    where: { imobiliariaId },
                    select: { status: true, prazoLimite: true }
                }),
                prisma.ocorrencia.groupBy({
                    by: ['gravidade'],
                    where: { imobiliariaId, status: 'ATIVA' },
                    _count: true
                }),
                prisma.ocorrencia.findMany({
                    where: { imobiliariaId, status: 'ATIVA', createdAt: { gte: inicio } },
                    select: { createdAt: true }
                })
            ])

        const contestacoesPorStatus = { ...STATUS_CONTESTACAO_INICIAL }
        for (const contestacao of contestacoes) {
            const statusEfetivo = calcularStatusEfetivo(contestacao)
            contestacoesPorStatus[statusEfetivo] += 1
        }

        const distribuicaoGravidade = { ...GRAVIDADE_INICIAL }
        for (const grupo of distribuicaoGravidadeRaw) {
            distribuicaoGravidade[grupo.gravidade] = grupo._count
        }

        return {
            totalOcorrenciasImobiliaria,
            totalConsultasImobiliaria,
            contestacoesPorStatus,
            distribuicaoGravidade,
            serieMensalImobiliaria: agruparPorMes(ocorrenciasImobiliaria.map((o) => o.createdAt))
        }
    }
}
