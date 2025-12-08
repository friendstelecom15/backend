import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { ProductColor } from './product-color.entity';
import { ProductRegion } from './product-region.entity';
import { ProductNetwork } from './product-network.entity';
import { ProductPrice } from './product-price.entity';

@Entity('product_storages')
@Index('IDX_product_storage_color_unique', ['colorId', 'storageSize'], {
  unique: true,
  background: true,
  partialFilterExpression: { colorId: { $type: 'objectId' } },
} as any)
@Index('IDX_product_storage_region_unique', ['regionId', 'storageSize'], {
  unique: true,
  background: true,
  partialFilterExpression: { regionId: { $type: 'objectId' } },
} as any)
@Index('IDX_product_storage_network_unique', ['networkId', 'storageSize'], {
  unique: true,
  background: true,
  partialFilterExpression: { networkId: { $type: 'objectId' } },
} as any)
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

  @Column({ default: false })
  isDefault: boolean; // true = this storage will be shown by default in UI

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

  @BeforeInsert()
  @BeforeUpdate()
  removeNulls() {
    if (!this.colorId) delete this.colorId;
    if (!this.regionId) delete this.regionId;
    if (!this.networkId) delete this.networkId;
  }
}
