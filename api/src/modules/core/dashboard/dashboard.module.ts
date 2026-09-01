import { Module } from '@nestjs/common'
import { DashboardController } from './dashboard.controller'
import DashboardUsecasesModule from './usecases/dashboard-usecases.module'

@Module({
    imports: [DashboardUsecasesModule],
    controllers: [DashboardController]
})
export default class DashboardModule {}
