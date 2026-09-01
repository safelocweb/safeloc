import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../../infra/system/security/decorators/current-user.decorator'
import { JwtAuthGuard } from '../../../infra/system/security/guards/jwt-auth.guard'
import { UsuarioFromJwtDto } from '../usuario/types/usuario-from-jwt.input'
import { DashboardResumoUsecase } from './usecases/dashboard-resumo.usecase'

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardResumoUsecase: DashboardResumoUsecase) {}

    @Get('resumo')
    async resumo(@CurrentUser() usuario: UsuarioFromJwtDto) {
        return this.dashboardResumoUsecase.execute(usuario.imobiliariaId)
    }
}
