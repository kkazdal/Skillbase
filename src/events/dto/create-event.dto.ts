import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  userId: string;

  @IsString()
  event: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  // meta can be any JSON payload
  meta?: any;
}


