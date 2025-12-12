import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { RedisModule } from './redis/redis.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
        entities: [User],
        synchronize: true,
      }),
    }),
    UsersModule,
    RedisModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
