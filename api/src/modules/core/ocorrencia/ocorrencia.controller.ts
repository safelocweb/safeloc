import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
    UseGuards
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { StatusOcorrencia, TipoOcorrencia } from '@prisma/client'
import { CurrentUser } from '../../../infra/system/security/decorators/current-user.decorator'
import { JwtAuthGuard } from '../../../infra/system/security/guards/jwt-auth.guard'
import { MasterGuard } from '../../../infra/system/security/guards/master.guard'
import { PapelAdminGuard } from '../../../infra/system/security/guards/papel-admin.guard'
import { UsuarioFromJwtDto } from '../usuario/types/usuario-from-jwt.input'
import { OcorrenciaCreateInput } from './types/ocorrencia-create.input'
import { OcorrenciaHistoricoQuery } from './types/ocorrencia-historico.query'
import { OcorrenciaConsultarPorCpfUsecase } from './usecases/ocorrencia-consultar-por-cpf.usecase'
import { OcorrenciaDetalharPorCpfUsecase } from './usecases/ocorrencia-detalhar-por-cpf.usecase'
import { OcorrenciaExcluirUsecase } from './usecases/ocorrencia-excluir.usecase'
import { OcorrenciaInserirUsecase } from './usecases/ocorrencia-inserir.usecase'
import { OcorrenciaListarExcluiveisUsecase } from './usecases/ocorrencia-listar-excluiveis.usecase'
import { OcorrenciaListarHistoricoUsecase } from './usecases/ocorrencia-listar-historico.usecase'
import { OcorrenciaListarTodasUsecase } from './usecases/ocorrencia-listar-todas.usecase'

@ApiTags('ocorrencia')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ocorrencias')
export class OcorrenciaController {
    constructor(
        private readonly ocorrenciaConsultarPorCpfUsecase: OcorrenciaConsultarPorCpfUsecase,
        private readonly ocorrenciaDetalharPorCpfUsecase: OcorrenciaDetalharPorCpfUsecase,
        private readonly ocorrenciaInserirUsecase: OcorrenciaInserirUsecase,
        private readonly ocorrenciaListarExcluiveisUsecase: OcorrenciaListarExcluiveisUsecase,
        private readonly ocorrenciaListarHistoricoUsecase: OcorrenciaListarHistoricoUsecase,
        private readonly ocorrenciaListarTodasUsecase: OcorrenciaListarTodasUsecase,
        private readonly ocorrenciaExcluirUsecase: OcorrenciaExcluirUsecase
    ) {}

    @UseGuards(MasterGuard)
    @Get('admin')
    async listarTodas(
        @Query('imobiliariaId') imobiliariaId?: string,
        @Query('usuarioId') usuarioId?: string,
        @Query('tipo') tipo?: TipoOcorrencia,
        @Query('status') status?: StatusOcorrencia,
        @Query('cpf') cpf?: string,
        @Query('de') de?: string,
        @Query('ate') ate?: string,
        @Query('page') page?: string,
        @Query('pageSize') pageSize?: string
    ) {
        return this.ocorrenciaListarTodasUsecase.execute({
            imobiliariaId: imobiliariaId ? Number(imobiliariaId) : undefined,
            usuarioId: usuarioId ? Number(usuarioId) : undefined,
            tipo,
            status,
            cpf,
            de: de ? new Date(de) : undefined,
            ate: ate ? new Date(ate) : undefined,
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 50
        })
    }

    @UseGuards(PapelAdminGuard)
    @Get('historico')
    async listarHistorico(@CurrentUser() usuario: UsuarioFromJwtDto, @Query() filtros: OcorrenciaHistoricoQuery) {
        return this.ocorrenciaListarHistoricoUsecase.execute(usuario.imobiliariaId, usuario.id, filtros)
    }

    @Get('consulta/:cpf')
    async consultar(@CurrentUser() usuario: UsuarioFromJwtDto, @Param('cpf') cpf: string) {
        return this.ocorrenciaConsultarPorCpfUsecase.execute(cpf, usuario.id, usuario.imobiliariaId)
    }

    @Get('consulta/:cpf/detalhes')
    async detalhar(@Param('cpf') cpf: string) {
        return this.ocorrenciaDetalharPorCpfUsecase.execute(cpf)
    }

    @UseGuards(PapelAdminGuard)
    @Post()
    async inserir(@CurrentUser() usuario: UsuarioFromJwtDto, @Body() input: OcorrenciaCreateInput) {
        return this.ocorrenciaInserirUsecase.execute(usuario.imobiliariaId, usuario.id, input)
    }

    @UseGuards(PapelAdminGuard)
    @Get('excluiveis/:cpf')
    async listarExcluiveis(@CurrentUser() usuario: UsuarioFromJwtDto, @Param('cpf') cpf: string) {
        return this.ocorrenciaListarExcluiveisUsecase.execute(usuario.imobiliariaId, cpf)
    }

    @UseGuards(PapelAdminGuard)
    @Delete(':id')
    async excluir(@CurrentUser() usuario: UsuarioFromJwtDto, @Param('id', ParseIntPipe) id: number) {
        await this.ocorrenciaExcluirUsecase.execute(usuario.imobiliariaId, usuario.id, id)
    }
}
