import { apiClient } from './api.service'
import { TipoOcorrencia } from '@/shared/constants/tipo-ocorrencia'
import { StatusContestacao } from '@/shared/constants/status-contestacao'

export interface ContestacaoOcorrenciaResumo {
    id: number
    cpfInquilino: string
    nomeInquilinoInformado: string
    tipos: TipoOcorrencia[]
}

export interface ContestacaoImobiliariaResumo {
    id: number
    nomeFantasia: string | null
    razaoSocial: string
}

export interface Contestacao {
    id: number
    motivoConsumidor: string
    status: StatusContestacao
    prazoLimite: string
    respondidaEm: string | null
    decisaoEm: string | null
    decisaoObservacao: string | null
    createdAt: string
    ocorrencia: ContestacaoOcorrenciaResumo
    imobiliaria: ContestacaoImobiliariaResumo
    _count: { documentos: number }
}

export interface ContestacaoDocumento {
    id: number
    nomeArquivo: string
    tamanhoBytes: number
    mimeType: string
    createdAt: string
    enviadoPorUsuario: { id: number; nomeCompleto: string }
}

export interface ContestacaoDetalhe extends Omit<Contestacao, '_count'> {
    ocorrencia: ContestacaoOcorrenciaResumo
    documentos: ContestacaoDocumento[]
}

export interface ContestacaoListResult {
    contestacoes: Contestacao[]
    total: number
    page: number
    pageSize: number
}

export interface ContestacaoListFiltros {
    imobiliariaId?: number
    status?: StatusContestacao
    cpf?: string
    page?: number
    pageSize?: number
}

export interface ContestacaoAbrirInput {
    ocorrenciaId: number
    motivoConsumidor: string
}

export interface ContestacaoDecidirInput {
    decisao: 'PROCEDENTE' | 'IMPROCEDENTE'
    observacao?: string
}

export const contestacaoService = {
    async abrir(input: ContestacaoAbrirInput): Promise<Contestacao> {
        const { data } = await apiClient.post<Contestacao>('/contestacoes', input)
        return data
    },

    async listar(filtros: ContestacaoListFiltros): Promise<ContestacaoListResult> {
        const { data } = await apiClient.get<ContestacaoListResult>('/contestacoes', { params: filtros })
        return data
    },

    async detalhar(id: number): Promise<ContestacaoDetalhe> {
        const { data } = await apiClient.get<ContestacaoDetalhe>(`/contestacoes/${id}`)
        return data
    },

    async enviarDocumento(id: number, arquivo: File): Promise<ContestacaoDocumento> {
        const formData = new FormData()
        formData.append('arquivo', arquivo)
        const { data } = await apiClient.post<ContestacaoDocumento>(
            `/contestacoes/${id}/documentos`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        return data
    },

    async baixarDocumento(contestacaoId: number, documentoId: number, nomeArquivo: string): Promise<void> {
        const { data } = await apiClient.get(`/contestacoes/${contestacaoId}/documentos/${documentoId}`, {
            responseType: 'blob'
        })
        const url = window.URL.createObjectURL(data as Blob)
        const link = document.createElement('a')
        link.href = url
        link.download = nomeArquivo
        link.click()
        window.URL.revokeObjectURL(url)
    },

    async decidir(id: number, input: ContestacaoDecidirInput): Promise<void> {
        await apiClient.patch(`/contestacoes/${id}/decisao`, input)
    }
}
