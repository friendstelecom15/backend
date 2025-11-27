
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('productspecs')
export class ProductSpec {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    title: string;

    @Column()
    value: string;

    @Column()
    productId: string;
}
