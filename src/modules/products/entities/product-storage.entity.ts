import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { ProductColor } from './product-color.entity';
import { ProductPrice } from './product-price.entity';

@Entity('product_storages')
export class ProductStorage {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  colorId: ObjectId;

  @Column()
  storageSize: string;

  @Column({ default: 0 })
  displayOrder: number;

  // Relations
  @ManyToOne(() => ProductColor, (color) => color.storages)
  color: ProductColor;

  @OneToOne(() => ProductPrice, (price) => price.storage, { cascade: true })
  price: ProductPrice;

  @CreateDateColumn()
  createdAt: Date;
}
