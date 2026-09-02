import * as dotenv from 'dotenv'
import * as path from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const environment = process.env.NODE_ENV || 'development'
const envFiles = [
    `.env.${environment}.local`,
    '.env.local',
    `.env.${environment}`,
    '.env'
]
const envPaths = envFiles.map((envFile) => path.resolve(process.cwd(), envFile))

for (const envPath of envPaths) {
    dotenv.config({ path: envPath })
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error(
        `DATABASE_URL is not defined. Tried loading: ${envFiles.join(', ')} (cwd: ${process.cwd()})`
    )
}

const adapter = new PrismaPg({ connectionString })

const prismaClientSingleton = () => new PrismaClient({ adapter })

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = prisma
}

export default prisma
