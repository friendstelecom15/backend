import { Entity, Column, CreateDateColumn, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('warrantyrecords')
export class WarrantyRecord {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ nullable: true })
  productId?: string;

  @Column({ unique: true, nullable: true })
  imei?: string;

  @Column({ unique: true, nullable: true })
  serial?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  purchaseDate?: Date;

  @Column({ nullable: true })
  expiryDate?: Date;

  @Column({ nullable: true })
  status?: string;

  @Column({ nullable: true })
  activatedBy?: string;

  @Column({ nullable: true })
  orderId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
