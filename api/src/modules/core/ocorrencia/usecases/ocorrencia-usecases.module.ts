import { Module } from '@nestjs/common'
import { AuditLogModule } from '../../../../infra/audit/audit-log.module'
import { OcorrenciaConsultarPorCpfUsecase } from './ocorrencia-consultar-por-cpf.usecase'
import { OcorrenciaDetalharPorCpfUsecase } from './ocorrencia-detalhar-por-cpf.usecase'
import { OcorrenciaExcluirUsecase } from './ocorrencia-excluir.usecase'
import { OcorrenciaInserirUsecase } from './ocorrencia-inserir.usecase'
import { OcorrenciaListarExcluiveisUsecase } from './ocorrencia-listar-excluiveis.usecase'
import { OcorrenciaListarHistoricoUsecase } from './ocorrencia-listar-historico.usecase'
import { OcorrenciaListarTodasUsecase } from './ocorrencia-listar-todas.usecase'

@Module({
    imports: [AuditLogModule],
    providers: [
        OcorrenciaConsultarPorCpfUsecase,
        OcorrenciaDetalharPorCpfUsecase,
        OcorrenciaInserirUsecase,
        OcorrenciaListarExcluiveisUsecase,
        OcorrenciaListarHistoricoUsecase,
        OcorrenciaListarTodasUsecase,
        OcorrenciaExcluirUsecase
    ],
    exports: [
        OcorrenciaConsultarPorCpfUsecase,
        OcorrenciaDetalharPorCpfUsecase,
        OcorrenciaInserirUsecase,
        OcorrenciaListarExcluiveisUsecase,
        OcorrenciaListarHistoricoUsecase,
        OcorrenciaListarTodasUsecase,
        OcorrenciaExcluirUsecase
    ]
})
export default class OcorrenciaUsecasesModule {}
