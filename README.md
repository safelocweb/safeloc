# Safeloc

Monorepo com a API NestJS/Prisma e a interface Next.js.

## Pré-requisitos

- Node.js `20.19.0` (use `nvm use`, se utiliza nvm)
- npm 10+
- Docker Desktop em execução

## Primeiro uso em uma nova máquina

Na raiz do repositório, execute:

```bash
npm run install:all
npm run setup
npm run db:up
npm run db:migrate
npm run db:seed
```

Em dois terminais separados, execute:

```bash
npm run dev:api
```

```bash
npm run dev:web
```

- Web: http://localhost:8010
- API: http://localhost:9010
- Swagger: http://localhost:9010/api-docs

O seed cria o usuário local de teste `admin` com a senha `senha123`.

## Configuração de ambiente

`npm run setup` cria `api/.env.local` e `web/.env.local` apenas se esses arquivos ainda não existirem. Eles são ignorados pelo Git e têm prioridade sobre `.env` e `.env.production`.

Nunca copie variáveis de produção, tokens da Vercel ou credenciais reais para `.env.local`. Produção deve manter variáveis exclusivamente no provedor de deploy.

## Banco local

O PostgreSQL local roda no Docker, com a porta do host `5443`. Para pará-lo, use:

```bash
npm run db:down
```

Os dados ficam no volume Docker `postgres_data` e continuam disponíveis entre reinicializações.
