import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: [
                `.env.${process.env.NODE_ENV || 'development'}.local`,
                '.env.local',
                `.env.${process.env.NODE_ENV || 'development'}`,
                '.env'
            ]
        })
    ],
    exports: [ConfigModule]
})
export class PersistenceModule {}
