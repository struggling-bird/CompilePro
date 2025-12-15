import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Environment } from './environment.entity';
import { EnvironmentNode } from './node.entity';
import { NodeCredential } from './credential.entity';

@Injectable()
export class EnvironmentsService {
  constructor(
    @InjectRepository(Environment)
    private readonly envRepo: Repository<Environment>,
    @InjectRepository(EnvironmentNode)
    private readonly nodeRepo: Repository<EnvironmentNode>,
    @InjectRepository(NodeCredential)
    private readonly credRepo: Repository<NodeCredential>,
  ) {}

  async createEnvironment(customerId: string, payload: Partial<Environment>) {
    const env = this.envRepo.create({
      name: payload.name!,
      url: payload.url!,
      account: payload.account,
      password: payload.password,
      supportRemote: !!payload.supportRemote,
      remoteMethod: payload.remoteMethod,
      remark: payload.remark,
      customer: { id: customerId } as unknown as Environment['customer'],
    });
    const saved = await this.envRepo.save(env);
    return { id: saved.id };
  }

  async updateEnvironment(
    customerId: string,
    envId: string,
    payload: Partial<Environment>,
  ) {
    const env = await this.envRepo.findOne({ where: { id: envId } });
    if (!env) throw new HttpException('环境不存在', 404);
    env.name = payload.name ?? env.name;
    env.url = payload.url ?? env.url;
    env.account = payload.account ?? env.account;
    env.password = payload.password ?? env.password;
    env.supportRemote = payload.supportRemote ?? env.supportRemote;
    env.remoteMethod = payload.remoteMethod ?? env.remoteMethod;
    env.remark = payload.remark ?? env.remark;
    await this.envRepo.save(env);
    return { id: env.id };
  }

  async deleteEnvironment(customerId: string, envId: string) {
    const env = await this.envRepo.findOne({ where: { id: envId } });
    if (!env) throw new HttpException('环境不存在', 404);
    await this.envRepo.remove(env);
    return { id: envId };
  }

  async listEnvironments(customerId: string) {
    const list = await this.envRepo.find({
      where: {
        customer: { id: customerId } as unknown as Environment['customer'],
      },
      order: { createdAt: 'DESC' },
    });
    return list.map((e) => ({
      id: e.id,
      name: e.name,
      url: e.url,
      account: e.account ?? null,
      password: e.password ?? null,
      supportRemote: e.supportRemote,
      remoteMethod: e.remoteMethod ?? null,
      remark: e.remark ?? null,
      createdAt: e.createdAt,
    }));
  }

  async getEnvironment(customerId: string, envId: string) {
    const e = await this.envRepo.findOne({ where: { id: envId } });
    if (!e) throw new HttpException('环境不存在', 404);
    return {
      id: e.id,
      name: e.name,
      url: e.url,
      account: e.account ?? null,
      password: e.password ?? null,
      supportRemote: e.supportRemote,
      remoteMethod: e.remoteMethod ?? null,
      remark: e.remark ?? null,
      createdAt: e.createdAt,
    };
  }

  async createNode(envId: string, payload: Partial<EnvironmentNode>) {
    const env = await this.envRepo.findOne({ where: { id: envId } });
    if (!env) throw new HttpException('环境不存在', 404);
    const node = this.nodeRepo.create({
      ip: payload.ip!,
      host: payload.host!,
      domain: payload.domain,
      memory: payload.memory!,
      cpu: payload.cpu!,
      chip: payload.chip!,
      os: payload.os!,
      diskType: payload.diskType!,
      diskSize: payload.diskSize!,
      remark: payload.remark,
      environment: { id: envId } as unknown as EnvironmentNode['environment'],
    });
    const saved = await this.nodeRepo.save(node);
    return { id: saved.id };
  }

  async updateNode(
    envId: string,
    nodeId: string,
    payload: Partial<EnvironmentNode>,
  ) {
    const node = await this.nodeRepo.findOne({ where: { id: nodeId } });
    if (!node) throw new HttpException('节点不存在', 404);
    node.ip = payload.ip ?? node.ip;
    node.host = payload.host ?? node.host;
    node.domain = payload.domain ?? node.domain;
    node.memory = payload.memory ?? node.memory;
    node.cpu = payload.cpu ?? node.cpu;
    node.chip = payload.chip ?? node.chip;
    node.os = payload.os ?? node.os;
    node.diskType = payload.diskType ?? node.diskType;
    node.diskSize = payload.diskSize ?? node.diskSize;
    node.remark = payload.remark ?? node.remark;
    await this.nodeRepo.save(node);
    return { id: node.id };
  }

  async deleteNode(envId: string, nodeId: string) {
    const node = await this.nodeRepo.findOne({ where: { id: nodeId } });
    if (!node) throw new HttpException('节点不存在', 404);
    await this.nodeRepo.remove(node);
    return { id: nodeId };
  }

  async listNodes(envId: string) {
    const list = await this.nodeRepo.find({
      where: {
        environment: { id: envId } as unknown as EnvironmentNode['environment'],
      },
      order: { createdAt: 'DESC' },
    });
    return list.map((n) => ({
      id: n.id,
      ip: n.ip,
      host: n.host,
      domain: n.domain ?? null,
      memory: n.memory,
      cpu: n.cpu,
      chip: n.chip,
      os: n.os,
      diskType: n.diskType,
      diskSize: n.diskSize,
      remark: n.remark ?? null,
      createdAt: n.createdAt,
    }));
  }

  async getNode(envId: string, nodeId: string) {
    const n = await this.nodeRepo.findOne({ where: { id: nodeId } });
    if (!n) throw new HttpException('节点不存在', 404);
    return {
      id: n.id,
      ip: n.ip,
      host: n.host,
      domain: n.domain ?? null,
      memory: n.memory,
      cpu: n.cpu,
      chip: n.chip,
      os: n.os,
      diskType: n.diskType,
      diskSize: n.diskSize,
      remark: n.remark ?? null,
      createdAt: n.createdAt,
    };
  }

  async upsertCredentials(
    nodeId: string,
    items: Array<Partial<NodeCredential>>,
  ) {
    const node = await this.nodeRepo.findOne({ where: { id: nodeId } });
    if (!node) throw new HttpException('节点不存在', 404);
    await this.credRepo.delete({
      node: { id: nodeId } as unknown as NodeCredential['node'],
    });
    const rows = items.map((i) =>
      this.credRepo.create({
        type: i.type!,
        username: i.username!,
        password: i.password!,
        description: i.description,
        node: { id: nodeId } as unknown as NodeCredential['node'],
      }),
    );
    await this.credRepo.save(rows);
    return { count: rows.length };
  }

  async listCredentials(nodeId: string) {
    const list = await this.credRepo.find({
      where: { node: { id: nodeId } as unknown as NodeCredential['node'] },
    });
    return list.map((c) => ({
      id: c.id,
      type: c.type,
      username: c.username,
      password: c.password,
      description: c.description ?? null,
    }));
  }
}
