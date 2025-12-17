import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('flashsells')
export class Flashsell {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  productId: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column()
  discountPrice: number;

  @Column()
  stock: number;
}
