import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('bottombanners')
export class BottomBanner {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    img: string;
}
