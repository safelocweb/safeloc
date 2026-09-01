import { Injectable } from '@nestjs/common'
import prisma from '../../../../infra/persistence/prisma'
import { sanitizeCpf } from '../../../../shared/utils/sanitize-cpf'

@Injectable()
export class OcorrenciaDetalharPorCpfUsecase {
    async execute(cpfInput: string) {
        const cpf = sanitizeCpf(cpfInput)

        return prisma.ocorrencia.findMany({
            where: { cpfInquilino: cpf, status: 'ATIVA' },
            select: {
                id: true,
                tipo: true,
                dataOcorrencia: true,
                situacaoAtual: true,
                faixaValor: true,
                gravidade: true,
                createdAt: true,
                imobiliaria: { select: { nomeFantasia: true, razaoSocial: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
    }
}
