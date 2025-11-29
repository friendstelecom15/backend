import { Entity, ObjectIdColumn, Column, OneToMany } from 'typeorm';
import { ObjectId } from 'mongodb';

import { Emi } from './emi.entity';

@Entity('banks')
export class Bank {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ unique: true })
  bankname: string;

  @OneToMany(() => Emi, emi => emi.bank)
  emis?: Emi[];
}
