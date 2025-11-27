import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateNotificationReadDto {
  @IsNotEmpty()
  @IsBoolean()
  read: boolean;
}
