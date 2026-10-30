import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import prisma from '../../../../infra/persistence/prisma'
import { calcularStatusEfetivo } from '../utils/calcular-status-efetivo'
import { UsuarioFromJwtDto } from '../../usuario/types/usuario-from-jwt.input'

@Injectable()
export class ContestacaoDetalharUsecase {
    async execute(usuarioAtual: UsuarioFromJwtDto, id: number) {
        const contestacao = await prisma.contestacao.findUnique({
            where: { id },
            select: {
                id: true,
                motivoConsumidor: true,
                status: true,
                prazoLimite: true,
                respondidaEm: true,
                decisaoEm: true,
                decisaoObservacao: true,
                createdAt: true,
                imobiliariaId: true,
                ocorrencia: {
                    select: {
                        id: true,
                        cpfInquilino: true,
                        nomeInquilinoInformado: true,
                        tipos: true
                    }
                },
                imobiliaria: { select: { id: true, nomeFantasia: true, razaoSocial: true } },
                documentos: {
                    select: {
                        id: true,
                        nomeArquivo: true,
                        tamanhoBytes: true,
                        mimeType: true,
                        createdAt: true,
                        enviadoPorUsuario: { select: { id: true, nomeCompleto: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        })

        if (!contestacao) {
            throw new NotFoundException('Contestação não encontrada')
        }

        if (usuarioAtual.role !== 'MASTER' && contestacao.imobiliariaId !== usuarioAtual.imobiliariaId) {
            throw new ForbiddenException('Você não tem acesso a essa contestação')
        }

        return { ...contestacao, status: calcularStatusEfetivo(contestacao) }
    }
}
