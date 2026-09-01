import { Injectable } from '@nestjs/common'
import prisma from '../../../../infra/persistence/prisma'
import { sanitizeCpf } from '../../../../shared/utils/sanitize-cpf'

@Injectable()
export class OcorrenciaListarExcluiveisUsecase {
    async execute(imobiliariaId: number, cpfInput: string) {
        const cpf = sanitizeCpf(cpfInput)

        return prisma.ocorrencia.findMany({
            where: { cpfInquilino: cpf, imobiliariaId, status: 'ATIVA' },
            select: {
                id: true,
                nomeInquilinoInformado: true,
                tipo: true,
                dataOcorrencia: true,
                situacaoAtual: true,
                faixaValor: true,
                gravidade: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        })
    }
}
