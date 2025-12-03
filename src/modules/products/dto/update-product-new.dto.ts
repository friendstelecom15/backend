import { PartialType } from '@nestjs/swagger';
import { CreateProductNewDto } from './create-product-new.dto';

export class UpdateProductNewDto extends PartialType(CreateProductNewDto) {}
