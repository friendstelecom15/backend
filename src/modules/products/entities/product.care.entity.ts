
import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('product_cares')
export class ProductCare {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ type: 'array', nullable: true })
  productIds?: string[];

  @Column({ type: 'array', nullable: true })
  categoryIds?: string[];

  @Column()
  planName: string;

  @Column()
  price: number; // e.g., 14400

  @Column({ nullable: true })
  duration?: string; // e.g., '2 years'

  @Column({ nullable: true })
  description?: string; // e.g., '2 years of extended warranty...'

  @Column({ type: 'array', nullable: true })
  features?: string[]; // e.g., ['Accidental damage', 'Battery replacement', 'Express repair']

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
