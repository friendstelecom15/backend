import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { ProductStorage } from './product-storage.entity';

@Entity('product_prices')
export class ProductPrice {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ unique: true })
  storageId: ObjectId;

  @Column()
  regularPrice: number;

  @Column({ nullable: true })
  comparePrice?: number;

  @Column({ nullable: true })
  discountPrice?: number;

  @Column({ nullable: true })
  discountPercent?: number;

  @Column({ nullable: true })
  campaignPrice?: number;

  @Column({ nullable: true })
  campaignStart?: Date;

  @Column({ nullable: true })
  campaignEnd?: Date;

  @Column({ default: 0 })
  stockQuantity: number;

  @Column({ default: 5 })
  lowStockAlert: number;

  // Relations
  @OneToOne(() => ProductStorage, (storage) => storage.price)
  storage: ProductStorage;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
