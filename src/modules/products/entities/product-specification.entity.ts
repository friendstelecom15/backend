import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { Product } from './product-new.entity';

@Entity('product_specifications')
@Index(['productId', 'specKey'], { unique: true, sparse: true })
export class ProductSpecification {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  productId: ObjectId;

  @Column()
  specKey: string;

  @Column()
  specValue: string;

  @Column({ default: 0 })
  displayOrder: number;

  // Relations
  @ManyToOne(() => Product, (product) => product.specifications)
  product: Product;

  @CreateDateColumn()
  createdAt: Date;
}
