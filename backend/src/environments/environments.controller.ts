import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EnvironmentsService } from './environments.service';
import { CreateEnvironmentDto } from './dto/create-environment.dto';
import { UpdateEnvironmentDto } from './dto/update-environment.dto';
import { CreateNodeDto } from './dto/create-node.dto';
import { UpdateNodeDto } from './dto/update-node.dto';
import { UpsertCredentialDto } from './dto/update-credentials.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { EnvironmentResponseDto } from './dto/environment-response.dto';
import { NodeResponseDto } from './dto/node-response.dto';
import { CredentialResponseDto } from './dto/credential-response.dto';

@Controller('customers/:customerId/environments')
@ApiTags('环境管理')
@UseGuards(AuthenticatedGuard)
export class EnvironmentsController {
  constructor(private readonly envs: EnvironmentsService) {}

  @Post()
  @ApiOperation({ summary: '创建环境' })
  @ApiBody({ type: CreateEnvironmentDto })
  @ApiResponse({ status: 200, description: '成功' })
  async createEnv(
    @Param('customerId') customerId: string,
    @Body() dto: CreateEnvironmentDto,
  ) {
    return this.envs.createEnvironment(customerId, dto);
  }

  @Get()
  @ApiOperation({ summary: '环境列表' })
  @ApiResponse({
    status: 200,
    description: '成功',
    type: [EnvironmentResponseDto],
  })
  async listEnv(@Param('customerId') customerId: string) {
    const list = await this.envs.listEnvironments(customerId);
    return { list };
  }

  @Get(':envId')
  @ApiOperation({ summary: '环境详情' })
  @ApiParam({ name: 'envId', description: '环境ID' })
  @ApiResponse({
    status: 200,
    description: '成功',
    type: EnvironmentResponseDto,
  })
  async getEnv(
    @Param('customerId') customerId: string,
    @Param('envId') envId: string,
  ) {
    return this.envs.getEnvironment(customerId, envId);
  }

  @Put(':envId')
  @ApiOperation({ summary: '编辑环境' })
  @ApiParam({ name: 'envId', description: '环境ID' })
  @ApiBody({ type: UpdateEnvironmentDto })
  @ApiResponse({ status: 200, description: '成功' })
  async updateEnv(
    @Param('customerId') customerId: string,
    @Param('envId') envId: string,
    @Body() dto: UpdateEnvironmentDto,
  ) {
    return this.envs.updateEnvironment(customerId, envId, dto);
  }

  @Delete(':envId')
  @ApiOperation({ summary: '删除环境' })
  @ApiParam({ name: 'envId', description: '环境ID' })
  @ApiResponse({ status: 200, description: '成功' })
  async deleteEnv(
    @Param('customerId') customerId: string,
    @Param('envId') envId: string,
  ) {
    return this.envs.deleteEnvironment(customerId, envId);
  }

  @Post(':envId/nodes')
  @ApiOperation({ summary: '新增节点' })
  @ApiParam({ name: 'envId', description: '环境ID' })
  @ApiBody({ type: CreateNodeDto })
  @ApiResponse({ status: 200, description: '成功' })
  async createNode(@Param('envId') envId: string, @Body() dto: CreateNodeDto) {
    return this.envs.createNode(envId, dto);
  }

  @Get(':envId/nodes')
  @ApiOperation({ summary: '节点列表' })
  @ApiParam({ name: 'envId', description: '环境ID' })
  @ApiResponse({ status: 200, description: '成功', type: [NodeResponseDto] })
  async listNodes(@Param('envId') envId: string) {
    const list = await this.envs.listNodes(envId);
    return { list };
  }

  @Get(':envId/nodes/:nodeId')
  @ApiOperation({ summary: '节点详情' })
  @ApiParam({ name: 'nodeId', description: '节点ID' })
  @ApiResponse({ status: 200, description: '成功', type: NodeResponseDto })
  async getNode(
    @Param('envId') envId: string,
    @Param('nodeId') nodeId: string,
  ) {
    return this.envs.getNode(envId, nodeId);
  }

  @Put(':envId/nodes/:nodeId')
  @ApiOperation({ summary: '编辑节点' })
  @ApiParam({ name: 'nodeId', description: '节点ID' })
  @ApiBody({ type: UpdateNodeDto })
  @ApiResponse({ status: 200, description: '成功' })
  async updateNode(
    @Param('envId') envId: string,
    @Param('nodeId') nodeId: string,
    @Body() dto: UpdateNodeDto,
  ) {
    return this.envs.updateNode(envId, nodeId, dto);
  }

  @Delete(':envId/nodes/:nodeId')
  @ApiOperation({ summary: '删除节点' })
  @ApiParam({ name: 'nodeId', description: '节点ID' })
  @ApiResponse({ status: 200, description: '成功' })
  async deleteNode(
    @Param('envId') envId: string,
    @Param('nodeId') nodeId: string,
  ) {
    return this.envs.deleteNode(envId, nodeId);
  }

  @Post(':envId/nodes/:nodeId/credentials')
  @ApiOperation({ summary: '新建节点凭据' })
  @ApiParam({ name: 'nodeId', description: '节点ID' })
  @ApiBody({ type: UpsertCredentialDto })
  @ApiResponse({ status: 200, description: '成功' })
  async createCred(
    @Param('nodeId') nodeId: string,
    @Body() dto: UpsertCredentialDto,
  ) {
    return this.envs.createCredential(nodeId, dto);
  }

  @Get(':envId/nodes/:nodeId/credentials')
  @ApiOperation({ summary: '节点凭据列表' })
  @ApiParam({ name: 'nodeId', description: '节点ID' })
  @ApiResponse({
    status: 200,
    description: '成功',
    type: [CredentialResponseDto],
  })
  async listCreds(@Param('nodeId') nodeId: string) {
    const list = await this.envs.listCredentials(nodeId);
    return { list };
  }

  @Put(':envId/nodes/:nodeId/credentials/:credId')
  @ApiOperation({ summary: '修改节点凭据' })
  @ApiParam({ name: 'nodeId', description: '节点ID' })
  @ApiParam({ name: 'credId', description: '凭据ID' })
  @ApiBody({ type: UpsertCredentialDto })
  @ApiResponse({ status: 200, description: '成功' })
  async updateCred(
    @Param('nodeId') nodeId: string,
    @Param('credId') credId: string,
    @Body() dto: UpsertCredentialDto,
  ) {
    return this.envs.updateCredential(nodeId, credId, dto);
  }

  @Delete(':envId/nodes/:nodeId/credentials/:credId')
  @ApiOperation({ summary: '删除节点凭据' })
  @ApiParam({ name: 'nodeId', description: '节点ID' })
  @ApiParam({ name: 'credId', description: '凭据ID' })
  @ApiResponse({ status: 200, description: '成功' })
  async deleteCred(
    @Param('nodeId') nodeId: string,
    @Param('credId') credId: string,
  ) {
    return this.envs.deleteCredential(nodeId, credId);
  }
}
