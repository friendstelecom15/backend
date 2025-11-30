import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
export class Product {
  @ObjectIdColumn()
  id: ObjectId;

  // Basic Information
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  // Highlights (array of strings)
  @Column({ type: 'array', nullable: true })
  highlights?: string[];

  // Category Relation
  @Column({ nullable: true })
  categoryId?: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category?: Category;

  // Product Identification
  @Column({ nullable: true })
  brandId?: string;

  // Brand object (for denormalized data)
  @Column({ type: 'json', nullable: true })
  brand?: any;

  @Column({ nullable: true })
  productCode?: string;

  @Column({ nullable: true })
  sku?: string;

  // Review/rating fields
  @Column({ nullable: true })
  rating?: number;

  @Column({ nullable: true })
  reviewCount?: number;

  @Column({ nullable: true })
  averageRating?: number;

  @Column({ nullable: true })
  rewardsPoints?: number;

  // Pricing Information
  @Column()
  basePrice: number;

  // Flexible price object (for nested price info)
  @Column({ type: 'json', nullable: true })
  priceObj?: any;

  @Column({ nullable: true })
  discountPrice?: number;

  @Column({ nullable: true })
  discountPercent?: number;

  @Column({ nullable: true })
  price?: number;

  @Column({ nullable: true })
  minBookingPrice?: number;

  @Column({ nullable: true })
  purchasePoints?: number;

  @Column({ nullable: true })
  model?: string;

  @Column({ nullable: true })
  slug?: string;

  // Product Classification
  @Column({ nullable: true })
  productType?: string;

  @Column({ nullable: true })
  warranty?: string;

  // Status Flags
  @Column({ default: false })
  isFeatured?: boolean;

  @Column({ default: false })
  isOfficial?: boolean;

  @Column({ default: false })
  isComing?: boolean;

  @Column({ default: false })
  isPreOrder?: boolean;

  @Column({ default: true })
  isActive?: boolean;

  @Column({ default: true })
  isOnline?: boolean;

  @Column({ default: false })
  freeShipping?: boolean;

  // Inventory
  @Column({ default: 0 })
  stock?: number;

  // Media
  @Column({ nullable: true })
  thumbnail?: string;

  @Column({ type: 'array', nullable: true })
  gallery?: string[];

  @Column({ type: 'array', nullable: true })
  image?: string[];

  // Variants (typed)
  @Column({ type: 'json', nullable: true })
  variants?: { name: string; price: string; stock: string }[];

  // Regions (typed)
  @Column({ type: 'json', nullable: true })
  regions?: { name: string; price: string; stock: string }[];

  // Colors (typed)
  @Column({ type: 'json', nullable: true })
  colors?: { name: string; code: string }[];

  // Networks, Sizes, Plugs
  @Column({ type: 'array', nullable: true })
  networks?: string[];

  @Column({ type: 'array', nullable: true })
  sizes?: string[];

  @Column({ type: 'array', nullable: true })
  plugs?: string[];

  @Column({ nullable: true })
  video?: string;

  // EMI
  @Column({ default: false })
  emiAvailable?: boolean;

  // SEO
  @Column({ nullable: true })
  seoTitle?: string;

  @Column({ nullable: true })
  seoDescription?: string;

  @Column({ type: 'array', nullable: true })
  seoKeywords?: string[];

  // Tags & Badges
  @Column({ type: 'array', nullable: true })
  tags?: string[];

  @Column({ type: 'array', nullable: true })
  badges?: string[];

  // Additional Data
  @Column({ type: 'json', nullable: true })
  dynamicInputs?: any;

  @Column({ type: 'json', nullable: true })
  details?: any;

  // Specifications (typed)
  @Column({ type: 'json', nullable: true })
  specifications?: { key: string; value: string }[];

  @Column({ type: 'json', nullable: true })
  campaigns?: any;

  @Column({ type: 'json', nullable: true })
  metaTitle?: any;

  @Column({ nullable: true })
  metaDescription?: string;

  @Column({ type: 'array', nullable: true })
  metaKeywords?: string[];

  // FAQ Relations
  @Column({ type: 'array', nullable: true })
  faqIds?: string[];

  // Status
  @Column({ default: true })
  status?: boolean;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
