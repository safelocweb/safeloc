import * as dotenv from 'dotenv'
import { defineConfig } from 'prisma/config'

const environment = process.env.NODE_ENV || 'development'

for (const envFile of [
    `.env.${environment}.local`,
    '.env.local',
    `.env.${environment}`,
    '.env'
]) {
    dotenv.config({ path: envFile })
}

export default defineConfig({
    schema: 'prisma',
    migrations: {
        path: 'prisma/migrations',
        seed: 'ts-node prisma/seed.ts'
    },
    datasource: {
        // O Migrate precisa de conexão direta (sem pgbouncer) — em produção (Neon) usar DIRECT_URL
        // (ou DATABASE_URL_UNPOOLED, nome usado pela integração Neon<>Vercel). Localmente nenhuma
        // das duas existe, então cai pra DATABASE_URL.
        url:
            process.env.DIRECT_URL ||
            process.env.DATABASE_URL_UNPOOLED ||
            process.env.DATABASE_URL ||
            ''
    }
})
