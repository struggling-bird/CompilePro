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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@Controller('customers')
@ApiTags('客户管理')
@UseGuards(AuthenticatedGuard)
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Post()
  @ApiOperation({ summary: '新增客户' })
  @ApiBody({ type: CreateCustomerDto })
  @ApiResponse({ status: 200, description: '成功' })
  async create(@Body() dto: CreateCustomerDto) {
    return this.customers.create({
      name: dto.name,
      status: dto.status,
      contactPerson: dto.contactPerson,
      contactPhone: dto.contactPhone,
      contactEmail: dto.contactEmail,
      contactDate: dto.contactDate,
      contactAddress: dto.contactAddress,
    });
  }

  @Get()
  @ApiOperation({ summary: '客户列表' })
  @ApiResponse({
    status: 200,
    description: '成功',
    type: [CustomerResponseDto],
  })
  async list() {
    const list = await this.customers.list();
    return { list };
  }

  @Get(':id')
  @ApiOperation({ summary: '查看客户详情' })
  @ApiParam({ name: 'id', description: '客户ID', type: String })
  @ApiResponse({ status: 200, description: '成功', type: CustomerResponseDto })
  async get(@Param('id') id: string) {
    return this.customers.getById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '编辑客户信息' })
  @ApiParam({ name: 'id', description: '客户ID', type: String })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiResponse({ status: 200, description: '成功' })
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customers.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除客户' })
  @ApiParam({ name: 'id', description: '客户ID', type: String })
  @ApiResponse({ status: 200, description: '成功' })
  async remove(@Param('id') id: string) {
    return this.customers.remove(id);
  }
}
