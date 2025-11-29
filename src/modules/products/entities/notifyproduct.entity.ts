import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('notify_products')
export class NotifyProduct {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  email?: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  productId: string;

  @Column()
  productName: string;

  @CreateDateColumn()
  createdAt: Date;
}
