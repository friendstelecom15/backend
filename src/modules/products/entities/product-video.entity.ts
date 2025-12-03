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

@Entity('product_videos')
export class ProductVideo {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  productId: ObjectId;

  @Column()
  videoUrl: string;

  @Column({ nullable: true })
  videoType?: string; // youtube, vimeo, cloudflare, etc.

  @Column({ default: 0 })
  displayOrder: number;

  // Relations
  @ManyToOne(() => Product, (product) => product.videos)
  product: Product;

  @CreateDateColumn()
  createdAt: Date;
}
