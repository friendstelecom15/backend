import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('givebanners')
export class GiveBanner {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    img: string;
}
