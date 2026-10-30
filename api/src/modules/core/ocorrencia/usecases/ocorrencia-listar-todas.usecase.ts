import { Injectable } from '@nestjs/common'
import { Prisma, StatusOcorrencia, TipoOcorrencia } from '@prisma/client'
import prisma from '../../../../infra/persistence/prisma'
import { sanitizeCpf } from '../../../../shared/utils/sanitize-cpf'

export interface OcorrenciaListarTodasFiltros {
    imobiliariaId?: number
    usuarioId?: number
    tipo?: TipoOcorrencia
    status?: StatusOcorrencia
    cpf?: string
    de?: Date
    ate?: Date
    page: number
    pageSize: number
}

@Injectable()
export class OcorrenciaListarTodasUsecase {
    async execute(filtros: OcorrenciaListarTodasFiltros) {
        const where: Prisma.OcorrenciaWhereInput = {
            imobiliariaId: filtros.imobiliariaId,
            usuarioId: filtros.usuarioId,
            tipos: filtros.tipo ? { has: filtros.tipo } : undefined,
            status: filtros.status,
            cpfInquilino: filtros.cpf ? sanitizeCpf(filtros.cpf) : undefined,
            createdAt:
                filtros.de || filtros.ate
                    ? { gte: filtros.de, lte: filtros.ate }
                    : undefined
        }

        const [ocorrencias, total] = await Promise.all([
            prisma.ocorrencia.findMany({
                where,
                select: {
                    id: true,
                    cpfInquilino: true,
                    nomeInquilinoInformado: true,
                    tipos: true,
                    dataOcorrencia: true,
                    situacaoAtual: true,
                    faixaValor: true,
                    mensagem: true,
                    status: true,
                    createdAt: true,
                    imobiliaria: { select: { id: true, nomeFantasia: true, razaoSocial: true } },
                    usuario: { select: { id: true, nomeCompleto: true, login: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip: (filtros.page - 1) * filtros.pageSize,
                take: filtros.pageSize
            }),
            prisma.ocorrencia.count({ where })
        ])

        return { ocorrencias, total, page: filtros.page, pageSize: filtros.pageSize }
    }
}
