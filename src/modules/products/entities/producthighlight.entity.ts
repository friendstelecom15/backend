
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('producthighlights')
export class ProductHighlight {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    text: string;

    @Column()
    productId: string;
}
