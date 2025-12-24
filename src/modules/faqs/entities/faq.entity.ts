import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('faqs')
export class FAQ {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  question: string;

  @Column()
  answer: string;

  @Column({ type: 'array', nullable: true })
  productIds?: string[];

  @Column({ type: 'array', nullable: true })
  categoryIds?: string[];

  @Column({ nullable: true })
  orderIndex?: number;

  @CreateDateColumn()
  createdAt: Date;
}
