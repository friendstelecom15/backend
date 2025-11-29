import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
export class Product {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  shortDescription?: string;

  @Column({ nullable: true })
  longDescription?: string;

  @Column()
  basePrice: number;

  @Column({ nullable: true })
  discountPrice?: number;

  @Column({ nullable: true })
  discountPercent?: number;

  @Column({ nullable: true })
  price?: number;

  @Column({ nullable: true })
  brandId?: string;

  @Column({ nullable: true })
  model?: string;

  @Column({ nullable: true })
  sku?: string;

  @Column({ nullable: true })
  categoryId?: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category?: Category;

  @Column({ nullable: true })
  productType?: string;

  @Column({ nullable: true })
  isFeatured?: boolean;

  @Column({ nullable: true })
  isNew?: boolean;

  @Column({ nullable: true })
  isHot?: boolean;

  @Column({ nullable: true })
  isOfficial?: boolean;

  @Column({ nullable: true })
  isComing?: boolean;

  @Column({ nullable: true })
  isPreOrder?: boolean;

  @Column({ nullable: true })
  seoTitle?: string;

  @Column({ nullable: true })
  seoDescription?: string;

  @Column({ type: 'array', nullable: true })
  tags?: string[];

  @Column({ type: 'array', nullable: true })
  badges?: string[];

  @Column({ nullable: true })
  thumbnail?: string;

  @Column({ type: 'array', nullable: true })
  gallery?: string[];

  @Column({ type: 'array', nullable: true })
  seoKeywords?: string[];

  @Column({ nullable: true })
  dynamicInputs?: any;

  @Column({ nullable: true })
  details?: any;

  @Column({ nullable: true })
  slug?: string;

  @Column({ nullable: true })
  video?: string;

  @Column({ type: 'array', nullable: true })
  images?: string[]; // alias for gallery if needed

  @Column({ nullable: true })
  stock?: number;

  @Column({ nullable: true })
  warranty?: string;

  @Column({ nullable: true })
  minBookingPrice?: number;

  @Column({ nullable: true })
  purchasePoints?: number;

  @Column({ type: 'json', nullable: true })
  campaigns?: any;

  @Column({ nullable: true })
  status?: string;

  @Column({ nullable: true })
  isActive?: boolean;

  @Column({ nullable: true })
  isOnline?: boolean;

  @Column({ nullable: true })
  freeShipping?: boolean;

  @Column({ type: 'json', nullable: true })
  meta?: any; // for meta fields like tags, badge, title, keywords, canonical, description, etc.

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'array', nullable: true })
  faqIds?: string[];
}
