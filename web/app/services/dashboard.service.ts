import { apiClient } from './api.service'
import { GravidadeOcorrencia } from '@/shared/constants/gravidade-ocorrencia'

export type StatusContestacaoEfetivo = 'ABERTA' | 'RESPONDIDA' | 'PROCEDENTE' | 'IMPROCEDENTE' | 'EXPIRADA'

export interface SerieMensalPonto {
    mes: string
    total: number
}

export interface DashboardResumo {
    totalOcorrenciasImobiliaria: number
    totalConsultasImobiliaria: number
    contestacoesPorStatus: Record<StatusContestacaoEfetivo, number>
    distribuicaoGravidade: Record<GravidadeOcorrencia, number>
    serieMensalImobiliaria: SerieMensalPonto[]
}

export const dashboardService = {
    async resumo(): Promise<DashboardResumo> {
        const { data } = await apiClient.get<DashboardResumo>('/dashboard/resumo')
        return data
    }
}
