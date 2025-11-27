import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('herobanners')
export class HeroBanner {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    img: string;
}
