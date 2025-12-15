import { ObjectId } from 'mongodb';
import { Entity, ObjectIdColumn, Column } from 'typeorm';

@Entity('corporate_deals')
export class CorporateDeal {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  fullName: string;

  @Column()
  companyName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  message?: string;

  @Column({ default: () => 'new' })
  status: string; // e.g., new, contacted, closed

  @Column({ default: () => 'now()' })
  createdAt: Date;
}
