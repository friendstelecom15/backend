import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('middlebanners')
export class MiddleBanner {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    img: string;
}
