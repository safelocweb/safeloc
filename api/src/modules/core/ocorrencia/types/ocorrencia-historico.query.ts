import { ApiPropertyOptional } from '@nestjs/swagger'
import { StatusOcorrencia, TipoOcorrencia } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class OcorrenciaHistoricoQuery {
    @ApiPropertyOptional({ enum: TipoOcorrencia })
    @IsOptional()
    @IsEnum(TipoOcorrencia, { message: 'Tipo de ocorrência inválido' })
    tipo?: TipoOcorrencia

    @ApiPropertyOptional({ enum: StatusOcorrencia })
    @IsOptional()
    @IsEnum(StatusOcorrencia, { message: 'Status inválido' })
    status?: StatusOcorrencia

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    cpf?: string

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number

    @ApiPropertyOptional({ default: 20, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    pageSize?: number
}
