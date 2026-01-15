import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  event: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  // meta can be any JSON payload
  meta?: any;
}


