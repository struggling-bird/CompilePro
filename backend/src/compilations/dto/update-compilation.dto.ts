import { PartialType } from '@nestjs/swagger';
import { CreateCompilationDto } from './create-compilation.dto';

export class UpdateCompilationDto extends PartialType(CreateCompilationDto) {}
