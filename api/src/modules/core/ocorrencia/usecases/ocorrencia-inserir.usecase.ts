import { Injectable } from '@nestjs/common'
import prisma from '../../../../infra/persistence/prisma'
import { AuditLogService } from '../../../../infra/audit/audit-log.service'
import { sanitizeCpf } from '../../../../shared/utils/sanitize-cpf'
import { OcorrenciaCreateInput } from '../types/ocorrencia-create.input'

@Injectable()
export class OcorrenciaInserirUsecase {
    constructor(private readonly auditLogService: AuditLogService) {}

    async execute(imobiliariaId: number, usuarioId: number, input: OcorrenciaCreateInput) {
        const ocorrencia = await prisma.ocorrencia.create({
            data: {
                cpfInquilino: sanitizeCpf(input.cpfInquilino),
                nomeInquilinoInformado: input.nomeInquilinoInformado,
                dataNascimentoInquilino: new Date(input.dataNascimentoInquilino),
                tipo: input.tipo,
                dataOcorrencia: new Date(input.dataOcorrencia),
                situacaoAtual: input.situacaoAtual,
                faixaValor: input.faixaValor,
                gravidade: input.gravidade,
                imobiliariaId,
                usuarioId
            }
        })

        await this.auditLogService.record({
            usuarioId,
            imobiliariaId,
            acao: 'INSERCAO_OCORRENCIA',
            cpfConsultado: ocorrencia.cpfInquilino,
            ocorrenciaId: ocorrencia.id
        })

        return ocorrencia
    }
}
