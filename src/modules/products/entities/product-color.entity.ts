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
import { ProductRegion } from './product-region.entity';
import { ProductStorage } from './product-storage.entity';
@Entity('product_colors')
export class ProductColor {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ nullable: true })
  productId?: ObjectId; // For products without region variant (direct color)

  @Column({ nullable: true })
  regionId?: ObjectId; // For products with region variant

  @Column()
  colorName: string;

  @Column({ nullable: true })
  colorImage?: string; // Image URL for this specific color variant

  @Column({ default: true })
  hasStorage: boolean; // false for color-only products (headphones)

  @Column({ nullable: true })
  singlePrice?: number; // Used when hasStorage = false (color-only)

  @Column({ nullable: true })
  singleComparePrice?: number;

  @Column({ nullable: true })
  singleStockQuantity?: number;

  @Column({ nullable: true })
  features?: string[]; // Color-specific features (e.g., 'Wireless Charging' for Black variant)

  @Column({ default: 0 })
  displayOrder: number;

  // Relations
  @ManyToOne(() => Product, (product) => product.directColors, { nullable: true })
  product?: Product; // For direct product-to-color (no region)

  @ManyToOne(() => ProductRegion, (region) => region.colors, { nullable: true })
  region?: ProductRegion; // For region-based colors

  @OneToMany(() => ProductStorage, (storage) => storage.color, { cascade: true })
  storages: ProductStorage[];

  @CreateDateColumn()
  createdAt: Date;
}
