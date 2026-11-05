# web — Frontend do Safeloc

## Escopo de Leitura

> **Instrução para o Claude:** Você está no projeto `web`. Use apenas este arquivo e o `CLAUDE.md` da raiz do repositório como contexto. Não explore o projeto `api`. Só leia arquivos de código quando for necessário editar ou entender algo específico solicitado pelo usuário.

## Localização
`/imobiliaria/web`

**Tipo:** Frontend Web
**Função:** Interface das imobiliárias para consultar, inserir e excluir ocorrências locatícias.

## Stack

| Tecnologia     | Versão  |
|----------------|---------|
| Node.js        | 20+     |
| Next.js        | 15.x    |
| React          | 18      |
| TypeScript     | 5.x     |
| Tailwind CSS   | 3.x     |
| TanStack Query | 5.x     |
| React Hook Form| 7.x     |
| Zod            | 3.x     |
| Axios          | 1.x     |

## Como Rodar

```bash
npm install
npm run dev       # porta 8010
```

**Porta:** `8010` | **Backend:** `api` (REST, porta 9010)

## Estrutura de Pastas

> Sem diretório `src/` — estrutura na raiz do projeto

```
app/
├── layout.tsx / page.tsx      # page.tsx só redireciona: logado -> /consultar, não -> /login
├── providers/
│   ├── react-query-provider.tsx
│   └── user-provider.tsx      # contexto do usuário logado, via GET /auth/me
├── services/                  # axios (api.service.ts) + um serviço por domínio
└── (pages)/
    ├── (public)/login/        # tela de login
    └── (auth)/                # layout com guarda de sessão + as 3 opções, nesta ordem:
        ├── consultar/          # CONSULTAR INFORMAÇÕES
        ├── inserir/            # INSERIR INFORMAÇÕES
        ├── excluir/            # EXCLUIR INFORMAÇÕES
        ├── historico/          # histórico de ocorrências da própria imobiliária
        └── usuarios/           # gerenciar os até-2 usuários da imobiliária
components/ui/    # subconjunto mínimo de componentes estilo shadcn (Button, Input, Card...)
shared/
├── enums/          # cookies, rotas
└── constants/      # tipos de ocorrência (valor Prisma + rótulo em PT-BR)
lib/                # cn() (tailwind-merge) e formatCpf()
```

## Comunicação com API

- **REST via Axios** — `app/services/api.service.ts` injeta `Authorization: Bearer` a partir do cookie `risco-locaticio.token` (via `nookies`) e redireciona para `/login` em qualquer 401.
- TanStack React Query para cache e mutações.
- Token gravado no login (`authService.login`) e removido no logout/401.

## Regras deste Projeto

- **Responder e funcionar sempre em Português do Brasil (PT-BR)**, independentemente do idioma usado na mensagem do usuário.
- Nunca usar `any` explícito em TypeScript
- Nunca usar `console.log` sem que seja solicitado
- Tailwind CSS **3.x**
- App Router sem `src/` — arquivos na raiz do projeto
- A ordem das 3 opções na tela principal (Consultar, Inserir, Excluir) é requisito do produto — não reordenar sem confirmar com o usuário
- Tipografia: usar a escala do `tailwind.config.ts` (`text-3xs` a `text-2xl`); não usar tamanhos em px como `text-[11px]`, que não acompanham a escala fluida do desktop
- Formulários sempre com `react-hook-form` + `zod` (`zodResolver`)
