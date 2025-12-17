import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('flashsells')
export class Flashsell {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  title: string;

  @Column()
  bannerImg: string;

  @Column()
  productIds: string[];

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column()
  discountpercentage : number;

  @Column()
  stock: number;
}
