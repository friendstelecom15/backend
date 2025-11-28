import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHerobannerDto {
  @IsNotEmpty()
  @IsString()
  img: string;
}
