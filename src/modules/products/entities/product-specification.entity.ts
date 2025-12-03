import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { Product } from './product-new.entity';
import { SpecGroup } from './spec-group.entity';

@Entity('product_specifications')
export class ProductSpecification {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  productId: ObjectId;

  @Column()
  specGroupId: ObjectId;

  @Column()
  specKey: string;

  @Column()
  specValue: string;

  @Column({ default: 0 })
  displayOrder: number;

  // Relations
  @ManyToOne(() => Product, (product) => product.specifications)
  product: Product;

  @ManyToOne(() => SpecGroup, (group) => group.specifications)
  specGroup: SpecGroup;

  @CreateDateColumn()
  createdAt: Date;
}
