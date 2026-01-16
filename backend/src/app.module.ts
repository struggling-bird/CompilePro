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
import { WinstonLogger } from './logger/logger.provider';
import { TypeOrmWinstonLogger } from './logger/typeorm-logger';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { AuditModule } from './audit/audit.module';
import { Customer } from './customers/customer.entity';
import { Environment } from './environments/environment.entity';
import { EnvironmentNode } from './environments/node.entity';
import { NodeCredential } from './environments/credential.entity';
import { MetaProject } from './metaprojects/metaproject.entity';
import { ProjectVersion } from './metaprojects/version.entity';
import { VersionConfig } from './metaprojects/version_config.entity';
import { EnvironmentsModule } from './environments/environments.module';
import { CustomersModule } from './customers/customers.module';
import { SystemModule } from './system/system.module';
import { MetaprojectsModule } from './metaprojects/metaprojects.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { StorageModule } from './storage/storage.module';
import { FileEntity } from './storage/file.entity';
import { StorageConfigModule } from './storage-config/storage-config.module';
import { StorageConfig } from './storage-config/entities/storage-config.entity';
import { StorageConfigHistory } from './storage-config/entities/storage-config-history.entity';
import { TemplatesModule } from './templates/templates.module';
import { CompilationsModule } from './compilations/compilations.module';
import { Compilation } from './compilations/entities/compilation.entity';
import { Template } from './templates/entities/template.entity';
import { TemplateVersion } from './templates/entities/template-version.entity';
import { TemplateGlobalConfig } from './templates/entities/template-global-config.entity';
import { TemplateModule as TemplateModuleEntity } from './templates/entities/template-module.entity';
import { TemplateModuleConfig } from './templates/entities/template-module-config.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CompilationGlobalConfig } from './compilations/entities/compilation-global-config.entity';
import { CompilationModuleConfig } from './compilations/entities/compilation-module-config.entity';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    SocketModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env' : '.env.dev',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ScheduleModule.forRoot(),
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
    LoggerModule,
    TypeOrmModule.forRootAsync({
      imports: [LoggerModule],
      inject: [ConfigService, WinstonLogger],
      useFactory: (config: ConfigService, winstonLogger: WinstonLogger) => ({
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
        entities: [
          User,
          Role,
          AuditLog,
          Customer,
          Environment,
          EnvironmentNode,
          NodeCredential,
          MetaProject,
          ProjectVersion,
          VersionConfig,
          FileEntity,
          StorageConfig,
          StorageConfigHistory,
          Template,
          TemplateVersion,
          TemplateGlobalConfig,
          TemplateModuleEntity,
          TemplateModuleConfig,
          Compilation,
          CompilationGlobalConfig,
          CompilationModuleConfig,
        ],
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
        logger: new TypeOrmWinstonLogger(winstonLogger),
      }),
    }),
    UsersModule,
    RedisModule,
    AuthModule,
    RolesModule,
    AuditModule,
    CustomersModule,
    EnvironmentsModule,
    SystemModule,
    StorageConfigModule,
    MetaprojectsModule,
    WorkspaceModule,
    StorageModule,
    TemplatesModule,
    CompilationsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
