import { Module } from '@nestjs/common'
import { DashboardResumoUsecase } from './dashboard-resumo.usecase'

@Module({
    providers: [DashboardResumoUsecase],
    exports: [DashboardResumoUsecase]
})
export default class DashboardUsecasesModule {}
