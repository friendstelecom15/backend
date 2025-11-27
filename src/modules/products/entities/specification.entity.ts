import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('specifications')
export class Specification {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    key: string;

    @Column()
    value: string;

    @Column()
    productId: string;
}
