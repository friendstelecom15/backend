
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
}
