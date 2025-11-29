import { Entity, ObjectIdColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

import { Bank } from './bank.entity';

@Entity('emis')
export class Emi {
  @ObjectIdColumn()
  id: ObjectId;


  @Column()
  bankId: string; // Reference to Bank entity

  @ManyToOne(() => Bank)
  @JoinColumn({ name: 'bankId' })
  bank?: Bank;

  @Column()
  months: number;

  @Column()
  planName: string;

  @Column('float')
  interestRate: number;
}
