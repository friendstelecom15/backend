import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('order_item_units')
export class OrderItemUnit {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  orderId: string;

  @Column()
  orderItemId: string;

  @Column()
  productId: string;

  @Column({ nullable: true })
  imei?: string;

  @Column({ nullable: true })
  serial?: string;

  @Column({ default: 'assigned' })
  status: 'assigned' | 'delivered' | 'returned';

  @CreateDateColumn()
  createdAt: Date;
}
