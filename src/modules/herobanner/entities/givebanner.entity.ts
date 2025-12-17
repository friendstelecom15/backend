import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('middlebanners')
export class GiveBanner {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    img: string;
}
