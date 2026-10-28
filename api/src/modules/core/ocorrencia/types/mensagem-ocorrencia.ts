import { TipoOcorrencia } from '@prisma/client'

export const MENSAGEM_OCORRENCIA_MAX_CARACTERES = 120

// Só esses tipos aceitam mensagem livre — nos demais o campo é rejeitado
export const TIPOS_OCORRENCIA_COM_MENSAGEM: TipoOcorrencia[] = [
    'ABANDONO_IMOVEL',
    'DANOS_MOBILIA',
    'DANOS_IMOVEL',
    'HIGIENE_LIMPEZA',
    'PERTURBACAO_SOSSEGO'
]
