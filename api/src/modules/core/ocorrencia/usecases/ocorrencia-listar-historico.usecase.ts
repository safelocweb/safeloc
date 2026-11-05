import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AuditLogService } from '../../../../infra/audit/audit-log.service'
import prisma from '../../../../infra/persistence/prisma'
import { sanitizeCpf } from '../../../../shared/utils/sanitize-cpf'
import { OcorrenciaHistoricoQuery } from '../types/ocorrencia-historico.query'

@Injectable()
export class OcorrenciaListarHistoricoUsecase {
    constructor(private readonly auditLogService: AuditLogService) {}

    // Escopado à imobiliária do usuário logado, inclusive registros excluídos (soft delete)
    async execute(imobiliariaId: number, usuarioId: number, filtros: OcorrenciaHistoricoQuery) {
        const page = filtros.page ?? 1
        const pageSize = filtros.pageSize ?? 20
        const cpf = filtros.cpf ? sanitizeCpf(filtros.cpf) : undefined

        const where: Prisma.OcorrenciaWhereInput = {
            imobiliariaId,
            tipos: filtros.tipo ? { has: filtros.tipo } : undefined,
            status: filtros.status,
            cpfInquilino: cpf
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
                    gravidade: true,
                    mensagem: true,
                    status: true,
                    excluidoEm: true,
                    createdAt: true,
                    usuario: { select: { id: true, nomeCompleto: true, login: true } }
                },
                orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            prisma.ocorrencia.count({ where })
        ])

        // Trocar de página não é uma nova consulta do CPF
        if (cpf && page === 1) {
            await this.auditLogService.record({
                usuarioId,
                imobiliariaId,
                acao: 'CONSULTA_CPF',
                cpfConsultado: cpf
            })
        }

        return { ocorrencias, total, page, pageSize }
    }
}
