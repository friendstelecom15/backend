import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { Product } from './product-new.entity';
import { ProductColor } from './product-color.entity';
import { ProductStorage } from './product-storage.entity';
@Entity('product_regions')
@Index(['productId', 'regionName'], { unique: true, sparse: true })
export class ProductRegion {
  @ObjectIdColumn()
  id: ObjectId;
  @Column()
  productId: ObjectId;

  @Column()
  regionName: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: 0 })
  displayOrder: number;

  // Relations
  @ManyToOne(() => Product, (product) => product.regions)
  product: Product;

  @OneToMany(() => ProductColor, (color) => color.region, { cascade: true })
  colors: ProductColor[];

  @OneToMany(() => ProductStorage, (storage) => storage.region, { cascade: true })
  defaultStorages: ProductStorage[]; // Shared storages for all colors in this region

  @CreateDateColumn()
  createdAt: Date;
}
