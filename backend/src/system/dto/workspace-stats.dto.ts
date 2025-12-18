import { ApiProperty } from '@nestjs/swagger';

export class ProjectStatsDto {
  @ApiProperty({ description: '项目ID' })
  id: string;

  @ApiProperty({ description: '项目名称' })
  name: string;

  @ApiProperty({ description: '项目描述' })
  description: string;

  @ApiProperty({ description: '项目占用空间大小(字节)' })
  size: number;
}

export class UserSpaceStatsDto {
  @ApiProperty({ description: '用户ID' })
  id: string;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '邮箱' })
  email: string;

  @ApiProperty({ description: '用户总占用空间(字节)' })
  size: number;

  @ApiProperty({ description: '项目数量' })
  projectCount: number;

  @ApiProperty({ description: '项目列表', type: [ProjectStatsDto] })
  projects: ProjectStatsDto[];
}

export class WorkspaceStatsDetailDto {
  @ApiProperty({ description: '总占用空间(字节)' })
  totalSize: number;

  @ApiProperty({ description: '总用户数' })
  totalUsers: number;

  @ApiProperty({ description: '总项目数' })
  totalProjects: number;

  @ApiProperty({ description: '用户空间详情', type: [UserSpaceStatsDto] })
  userSpaces: UserSpaceStatsDto[];
}
