import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { User } from './users/user.entity';
import { Role } from './roles/role.entity';
import { AuditLog } from './audit/audit.entity';
import { UsersModule } from './users/users.module';
import { RedisModule } from './redis/redis.module';
import * as path from 'path';
import { LoggerModule } from './logger/logger.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : '.env.dev',
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: await redisStore({
          url: `redis://${config.get<string>('REDIS_HOST') ?? '127.0.0.1'}:${Number(
            config.get<number>('REDIS_PORT') ?? 6379,
          )}`,
        }),
        ttl: 30000,
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host:
          config.get<string>('DB_HOST') ??
          config.get<string>('MYSQL_HOST') ??
          '127.0.0.1',
        port: Number(
          config.get<number>('DB_PORT') ??
            config.get<number>('MYSQL_PORT') ??
            3306,
        ),
        username:
          config.get<string>('DB_USERNAME') ??
          config.get<string>('MYSQL_USER') ??
          'root',
        password:
          (config.get<string>('DB_PASSWORD') ??
            config.get<string>('MYSQL_PASSWORD')) ||
          undefined,
        database: config.get<string>('MYSQL_DB') ?? 'compilepro',
        entities: [User, Role, AuditLog],
        synchronize: (config.get<string>('DB_SYNC') ?? 'false') === 'true',
        migrationsRun:
          (config.get<string>('DB_MIGRATIONS_RUN') ??
            ((config.get<string>('DB_SYNC') ?? 'false') === 'true'
              ? 'false'
              : 'true')) === 'true',
        migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],
        logging: (() => {
          const raw = config.get<string>('DB_LOGGING');
          if (raw === 'true') return true;
          if (raw === 'false') return false;
          return false;
        })(),
      }),
    }),
    UsersModule,
    RedisModule,
    LoggerModule,
    AuthModule,
    RolesModule,
    AuditModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
