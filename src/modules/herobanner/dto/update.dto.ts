import { PartialType } from '@nestjs/mapped-types';
import { CreateHerobannerDto } from './create.dto';

export class UpdateHerobannerDto extends PartialType(CreateHerobannerDto) {}
