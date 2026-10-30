import { ArrayMinSize, ArrayUnique, IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { FaixaValorOcorrencia, GravidadeOcorrencia, SituacaoOcorrencia, TipoOcorrencia } from '@prisma/client'
import { MENSAGEM_OCORRENCIA_MAX_CARACTERES } from './mensagem-ocorrencia'

export class OcorrenciaCreateInput {
    @IsString()
    @IsNotEmpty({ message: 'O nome completo do inquilino é obrigatório' })
    nomeInquilinoInformado: string

    @IsString()
    @IsNotEmpty({ message: 'O CPF é obrigatório' })
    cpfInquilino: string

    @IsDateString({}, { message: 'Data de nascimento inválida' })
    dataNascimentoInquilino: string

    @IsArray({ message: 'Os tipos de ocorrência devem ser uma lista' })
    @ArrayMinSize(1, { message: 'Selecione ao menos um tipo de ocorrência' })
    @ArrayUnique({ message: 'Tipos de ocorrência duplicados' })
    @IsEnum(TipoOcorrencia, { each: true, message: 'Tipo de ocorrência inválido' })
    tipos: TipoOcorrencia[]

    @IsDateString({}, { message: 'Data da ocorrência inválida' })
    dataOcorrencia: string

    @IsEnum(SituacaoOcorrencia, { message: 'Situação atual inválida' })
    situacaoAtual: SituacaoOcorrencia

    @IsEnum(FaixaValorOcorrencia, { message: 'Faixa de valor inválida' })
    faixaValor: FaixaValorOcorrencia

    @IsEnum(GravidadeOcorrencia, { message: 'Gravidade inválida' })
    gravidade: GravidadeOcorrencia

    @IsOptional()
    @IsString()
    @MaxLength(MENSAGEM_OCORRENCIA_MAX_CARACTERES, {
        message: `A mensagem deve ter no máximo ${MENSAGEM_OCORRENCIA_MAX_CARACTERES} caracteres`
    })
    mensagem?: string
}
