import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import * as Joi from 'joi'
import { JwtStrategy } from './infra/system/security/decorators/jwt.strategy'
import { AuditLogModule } from './infra/audit/audit-log.module'
import AuthModule from './modules/core/auth/auth.module'
import ImobiliariaModule from './modules/core/imobiliaria/imobiliaria.module'
import UsuarioModule from './modules/core/usuario/usuario.module'
import OcorrenciaModule from './modules/core/ocorrencia/ocorrencia.module'
import ContestacaoModule from './modules/core/contestacao/contestacao.module'
import DashboardModule from './modules/core/dashboard/dashboard.module'
import NotificacaoModule from './modules/core/notificacao/notificacao.module'
import LogModule from './modules/core/log/log.module'
import TermoAceiteModule from './modules/core/termo-aceite/termo-aceite.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
            validationSchema: Joi.object({
                DATABASE_URL: Joi.string().required(),
                PORT: Joi.number().required(),
                JWT_SECRET: Joi.string().required(),
                JWT_EXPIRES_IN: Joi.string().required(),
                URL_FRONT_END: Joi.string().required(),
                UPLOADS_DIR: Joi.string().default('./uploads')
            })
        }),
        ThrottlerModule.forRoot([
            {
                ttl: 60_000,
                limit: 60
            }
        ]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        AuditLogModule,
        AuthModule,
        ImobiliariaModule,
        UsuarioModule,
        OcorrenciaModule,
        ContestacaoModule,
        DashboardModule,
        NotificacaoModule,
        LogModule,
        TermoAceiteModule
    ],
    controllers: [],
    providers: [JwtStrategy, { provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule {}
