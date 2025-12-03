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

@Entity('product_images')
export class ProductImage {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  productId: ObjectId;

  @Column()
  imageUrl: string;

  @Column({ default: false })
  isThumbnail: boolean;

  @Column({ nullable: true })
  altText?: string;

  @Column({ default: 0 })
  displayOrder: number;

  // Relations
  @ManyToOne(() => Product, (product) => product.images)
  product: Product;

  @CreateDateColumn()
  createdAt: Date;
}
