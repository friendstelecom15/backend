import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { ProductImage } from './product-image.entity';
import { ProductVideo } from './product-video.entity';
import { ProductSpecification } from './product-specification.entity';
import { ProductRegion } from './product-region.entity';

@Entity('products')
export class Product {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  categoryId?: ObjectId;

  @Column({ nullable: true })
  brandId?: ObjectId;

  @Column({ nullable: true })
  productCode?: string;

  @Column({ nullable: true })
  sku?: string;

  @Column({ nullable: true })
  warranty?: string;

  // Status Flags
  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  isOnline: boolean;

  @Column({ default: true })
  isPos: boolean;

  @Column({ default: false })
  isPreOrder: boolean;

  @Column({ default: false })
  isOfficial: boolean;

  @Column({ default: false })
  freeShipping: boolean;

  // Reward & Booking
  @Column({ default: 0 })
  rewardPoints: number;

  @Column({ default: 0 })
  minBookingPrice: number;

  // SEO Fields
  @Column({ nullable: true })
  seoTitle?: string;

  @Column({ nullable: true })
  seoDescription?: string;

  @Column({ type: 'array', nullable: true })
  seoKeywords?: string[];

  @Column({ nullable: true })
  seoCanonical?: string;

  @Column({ type: 'array', nullable: true })
  tags?: string[];

  // Relations
  @OneToMany(() => ProductRegion, (region) => region.product, { cascade: true })
  regions: ProductRegion[];

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @OneToMany(() => ProductVideo, (video) => video.product, { cascade: true })
  videos: ProductVideo[];

  @OneToMany(() => ProductSpecification, (spec) => spec.product, { cascade: true })
  specifications: ProductSpecification[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ type: 'array', nullable: true })
  faqIds?: ObjectId[];
}
