import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Environment } from './environment.entity';
import { EnvironmentNode } from './node.entity';
import { NodeCredential } from './credential.entity';
import { EnvironmentsService } from './environments.service';
import { EnvironmentsController } from './environments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Environment, EnvironmentNode, NodeCredential]),
  ],
  providers: [EnvironmentsService],
  controllers: [EnvironmentsController],
  exports: [EnvironmentsService],
})
export class EnvironmentsModule {}
