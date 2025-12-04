import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { ProductColor } from './product-color.entity';
import { ProductRegion } from './product-region.entity';
import { ProductNetwork } from './product-network.entity';
import { ProductPrice } from './product-price.entity';

@Entity('product_storages')
@Index(['colorId', 'storageSize'], { unique: true, sparse: true })
@Index(['colorId', 'networkId', 'storageSize'], { unique: true, sparse: true })
export class ProductStorage {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ nullable: true })
  colorId?: ObjectId; // Null if this is a region default storage

  @Column({ nullable: true })
  regionId?: ObjectId; // For region-level default storages

  @Column({ nullable: true })
  networkId?: ObjectId; // For network-specific storage pricing (WiFi vs Cellular)

  @Column()
  storageSize: string;

  @Column({ default: 0 })
  displayOrder: number;

  // Relations
  @ManyToOne(() => ProductColor, (color) => color.storages, { nullable: true })
  color?: ProductColor; // Null if this is a region default storage

  @ManyToOne(() => ProductRegion, (region) => region.defaultStorages, { nullable: true })
  region?: ProductRegion; // For region-level default storages

  @ManyToOne(() => ProductNetwork, (network) => network.storages, { nullable: true })
  network?: ProductNetwork; // Optional: for network-based storage variants

  @OneToOne(() => ProductPrice, (price) => price.storage, { cascade: true })
  price: ProductPrice;

  @CreateDateColumn()
  createdAt: Date;
}
