import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import prisma from '../../../../infra/persistence/prisma'
import { calcularStatusEfetivo, StatusContestacaoEfetivo } from '../utils/calcular-status-efetivo'

export interface ContestacaoListarFiltros {
    imobiliariaId?: number
    status?: StatusContestacaoEfetivo
    cpf?: string
    page: number
    pageSize: number
}

@Injectable()
export class ContestacaoListarUsecase {
    async execute(filtros: ContestacaoListarFiltros) {
        const agora = new Date()

        const where: Prisma.ContestacaoWhereInput = {
            imobiliariaId: filtros.imobiliariaId,
            ocorrencia: filtros.cpf ? { cpfInquilino: filtros.cpf } : undefined
        }

        if (filtros.status === 'EXPIRADA') {
            where.status = 'ABERTA'
            where.prazoLimite = { lt: agora }
        } else if (filtros.status === 'ABERTA') {
            where.status = 'ABERTA'
            where.prazoLimite = { gte: agora }
        } else if (filtros.status) {
            where.status = filtros.status
        }

        const [contestacoes, total] = await Promise.all([
            prisma.contestacao.findMany({
                where,
                select: {
                    id: true,
                    motivoConsumidor: true,
                    status: true,
                    prazoLimite: true,
                    respondidaEm: true,
                    decisaoEm: true,
                    decisaoObservacao: true,
                    createdAt: true,
                    ocorrencia: {
                        select: { id: true, cpfInquilino: true, nomeInquilinoInformado: true, tipos: true }
                    },
                    imobiliaria: { select: { id: true, nomeFantasia: true, razaoSocial: true } },
                    _count: { select: { documentos: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip: (filtros.page - 1) * filtros.pageSize,
                take: filtros.pageSize
            }),
            prisma.contestacao.count({ where })
        ])

        return {
            contestacoes: contestacoes.map((contestacao) => ({
                ...contestacao,
                status: calcularStatusEfetivo(contestacao)
            })),
            total,
            page: filtros.page,
            pageSize: filtros.pageSize
        }
    }
}
