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
import { ProductRegion } from './product-region.entity';
import { ProductNetwork } from './product-network.entity';
import { ProductStorage } from './product-storage.entity';

@Entity('product_colors')
@Index(['productId', 'colorName'], { unique: true, sparse: true }) // Unique per product
@Index(['regionId', 'colorName'], { unique: true, sparse: true })  // Unique per region
@Index(['networkId', 'colorName'], { unique: true, sparse: true }) // Unique per network
export class ProductColor {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ nullable: true })
  productId?: ObjectId; // For products without region variant (direct color)

  @Column({ nullable: true })
  regionId?: ObjectId; // For products with region variant

  @Column({ nullable: true })
  networkId?: ObjectId; // For products with network variant (WiFi, WiFi+Cellular)

  @Column()
  colorName: string;

  @Column({ nullable: true })
  colorImage?: string; // Image URL for this specific color variant

  @Column({ default: true })
  hasStorage: boolean; // false for color-only products (headphones)

  @Column({ default: true })
  useDefaultStorages: boolean; // true = use region's defaultStorages, false = use custom storages

  @Column({ nullable: true })
  singlePrice?: number; // Used when hasStorage = false (color-only)

  @Column({ nullable: true })
  singleComparePrice?: number;

  @Column({ nullable: true })
  singleDiscountPercent?: number;

  @Column({ nullable: true })
  singleDiscountPrice?: number;

  @Column({ nullable: true })
  singleStockQuantity?: number;

  @Column({ nullable: true })
  singleLowStockAlert?: number;

  @Column({ nullable: true })
  features?: string[]; // Color-specific features (e.g., 'Wireless Charging' for Black variant)

  @Column({ default: 0 })
  displayOrder: number;

  // Relations
  @ManyToOne(() => Product, (product) => product.directColors, { nullable: true })
  product?: Product; // For direct product-to-color (no region)

  @ManyToOne(() => ProductRegion, (region) => region.colors, { nullable: true })
  region?: ProductRegion; // For region-based colors

  @ManyToOne(() => ProductNetwork, (network) => network.colors, { nullable: true })
  network?: ProductNetwork; // For network-based colors

  @OneToMany(() => ProductStorage, (storage) => storage.color, { cascade: true })
  storages: ProductStorage[];

  @CreateDateColumn()
  createdAt: Date;
}
