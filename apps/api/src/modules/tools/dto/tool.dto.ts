import { IsString, IsOptional, IsUrl, IsBoolean, IsEnum } from 'class-validator';
import { ToolStatus } from '@prisma/client';

export class CreateToolDto {
  @IsString() name!: string;
  @IsString() slug!: string;
  @IsString() description!: string;
  @IsUrl() url!: string;
  @IsOptional() @IsUrl() iconUrl?: string;
  @IsString() categoryId!: string;
  @IsOptional() @IsBoolean() isClaw?: boolean;
  @IsOptional() tags?: string[]; // tag ids
}

export class UpdateToolDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUrl() url?: string;
  @IsOptional() @IsUrl() iconUrl?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsEnum(ToolStatus) status?: ToolStatus;
  @IsOptional() @IsBoolean() isClaw?: boolean;
  @IsOptional() tags?: string[];
}

export class QueryToolDto {
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() status?: ToolStatus;
  @IsOptional() @IsBoolean() isClaw?: boolean;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}
