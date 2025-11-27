import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
