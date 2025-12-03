import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { Product } from './product-new.entity';
import { ProductColor } from './product-color.entity';
@Entity('product_regions')
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

  @CreateDateColumn()
  createdAt: Date;
}
