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
import { ProductRegion } from './product-region.entity';
import { ProductStorage } from './product-storage.entity';
@Entity('product_colors')
export class ProductColor {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  regionId: ObjectId;

  @Column()
  colorName: string;

  @Column()
  colorCode: string;

  @Column({ default: 0 })
  displayOrder: number;

  // Relations
  @ManyToOne(() => ProductRegion, (region) => region.colors)
  region: ProductRegion;

  @OneToMany(() => ProductStorage, (storage) => storage.color, { cascade: true })
  storages: ProductStorage[];

  @CreateDateColumn()
  createdAt: Date;
}
