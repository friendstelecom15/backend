
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsEnum(NotificationType)
  type: NotificationType;


  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  read?: boolean;

  @IsOptional()
  resolved?: boolean;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  isAdmin?: boolean;
}
