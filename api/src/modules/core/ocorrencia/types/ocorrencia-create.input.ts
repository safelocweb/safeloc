import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { FaixaValorOcorrencia, GravidadeOcorrencia, SituacaoOcorrencia, TipoOcorrencia } from '@prisma/client'

export class OcorrenciaCreateInput {
    @IsString()
    @IsNotEmpty({ message: 'O nome completo do inquilino é obrigatório' })
    nomeInquilinoInformado: string

    @IsString()
    @IsNotEmpty({ message: 'O CPF é obrigatório' })
    cpfInquilino: string

    @IsDateString({}, { message: 'Data de nascimento inválida' })
    dataNascimentoInquilino: string

    @IsEnum(TipoOcorrencia, { message: 'Tipo de ocorrência inválido' })
    tipo: TipoOcorrencia

    @IsDateString({}, { message: 'Data da ocorrência inválida' })
    dataOcorrencia: string

    @IsEnum(SituacaoOcorrencia, { message: 'Situação atual inválida' })
    situacaoAtual: SituacaoOcorrencia

    @IsEnum(FaixaValorOcorrencia, { message: 'Faixa de valor inválida' })
    faixaValor: FaixaValorOcorrencia

    @IsEnum(GravidadeOcorrencia, { message: 'Gravidade inválida' })
    gravidade: GravidadeOcorrencia
}
