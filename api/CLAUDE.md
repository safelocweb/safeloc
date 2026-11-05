# api — Backend do Safeloc

## Escopo de Leitura

> **Instrução para o Claude:** Você está no projeto `api`. Use apenas este arquivo e o `CLAUDE.md` da raiz do repositório como contexto. Não explore o projeto `web`. Só leia arquivos de código quando for necessário editar ou entender algo específico solicitado pelo usuário.

## Localização
`/imobiliaria/api`

**Tipo:** Backend REST
**Função:** API da plataforma — autentica imobiliárias, e expõe consulta, inserção e exclusão de ocorrências locatícias por CPF, com rastreabilidade completa (auditoria).

## Stack

| Tecnologia | Versão |
|------------|--------|
| Node.js    | 20+    |
| NestJS     | 11.0.1 |
| TypeScript | 5.x    |
| Prisma     | 7.8.0  |
| PostgreSQL | 17     |
| Swagger    | 11.4.4 |

## Como Rodar

```bash
docker-compose up -d          # sobe o banco
npm install
npm run psm:dev               # migrations
npm run seed                  # cria imobiliária + usuário de teste (login: admin / senha: senha123)
npm run dev                   # inicia (porta 9010)
```

**Porta:** `9010` | **DB:** `localhost:5443` → `risco_locaticio` | **Swagger:** `/api-docs`

## Estrutura de Pastas

```
src/
├── modules/core/
│   ├── auth/          # login (JWT) e /auth/me
│   ├── imobiliaria/   # dados da própria imobiliária logada
│   ├── usuario/       # até 2 usuários por imobiliária
│   └── ocorrencia/    # consultar / inserir / excluir ocorrências por CPF
├── infra/
│   ├── persistence/   # Prisma client singleton
│   ├── audit/          # AuditLogService — grava quem fez o quê
│   └── system/
│       ├── security/   # JwtStrategy, JwtAuthGuard, @IsPublic, @CurrentUser
│       └── helpers/crypto/  # hash/compare de senha (bcrypt)
└── shared/utils/       # sanitizeCpf etc.
prisma/
├── schema.prisma        # generator + datasource
├── *.prisma              # um arquivo por domínio (imobiliarias, usuarios, ocorrencias, audit-logs, enums)
├── migrations/
└── seed.ts
```

## Padrão de Módulo (REST, clean-usecase)

```
<nome>/
├── <nome>.module.ts
├── <nome>.controller.ts       # endpoints REST, delega tudo pro usecase
├── types/                     # DTOs de entrada (class-validator)
└── usecases/
    ├── <acao>.usecase.ts      # uma classe por ação, lógica de negócio aqui
    └── <nome>-usecases.module.ts
```

Regra de negócio central (não é decisão de implementação, vem do produto):
- **Consultar** (`GET /ocorrencias/consulta/:cpf`, `/detalhes`) é **cross-tenant**: qualquer imobiliária logada vê ocorrências ativas de qualquer outra imobiliária para aquele CPF — é o propósito colaborativo da base.
- **Excluir** (`DELETE /ocorrencias/:id`, listagem em `/ocorrencias/excluiveis/:cpf`) é **escopado**: só a imobiliária que registrou a ocorrência pode vê-la nessa lista e excluí-la.
- **Histórico** (`GET /ocorrencias/historico`) é **escopado**: a imobiliária vê só o que ela registrou, inclusive excluídas; o `imobiliariaId` vem sempre do JWT.
- Exclusão é sempre **soft delete** (`status: EXCLUIDA`) — nunca apagar a linha do banco.
- Toda ação sensível grava `AuditLog` via `AuditLogService.record(...)` (login, consulta por CPF, inserção, exclusão).

## Auth

- JWT Bearer, `POST /auth/login` (login + senha) retorna `{ accessToken }`.
- Payload do JWT: `{ id, imobiliariaId, nomeCompleto, email, role }` — evita rebuscar a imobiliária no banco a cada request.
- `role: UsuarioRole` tem `IMOBILIARIA` e `MASTER`. `MASTER` está preparado no schema para o futuro acesso do dono da plataforma, mas **não tem nenhuma rota ou funcionalidade própria ainda** — não construir painel master sem pedido explícito.
- Rotas protegidas usam `@UseGuards(JwtAuthGuard)` no controller (não há guard global). `@IsPublic()` existe para casos futuros de rota pública dentro de um controller protegido.

## Banco de Dados

```bash
npm run psm:dev       # prisma migrate dev
npm run seed          # seed
npx prisma studio     # interface visual
```

## Regras deste Projeto

- **Responder e funcionar sempre em Português do Brasil (PT-BR)**, independentemente do idioma usado na mensagem do usuário.
- Nunca usar `any` explícito em TypeScript
- Nunca usar `console.log` sem que seja solicitado
- API **REST** — usar controllers, não resolvers
- Lógica de negócio no usecase, nunca no controller
- DTOs com `class-validator`
- Senhas sempre via `CryptoService` (bcrypt) — nunca comparar/armazenar em texto puro
