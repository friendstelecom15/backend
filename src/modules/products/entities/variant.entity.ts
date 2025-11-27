import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('variants')
export class Variant {
    @ObjectIdColumn()
    id: ObjectId;

    @Column({ nullable: true })
    storage?: string;

    @Column({ nullable: true })
    color?: string;

    @Column({ nullable: true })
    colorHex?: string;

    @Column()
    price: number;

    @Column({ default: 0 })
    stock: number;

    @Column({ type: 'array', default: [] })
    images: string[];

    @Column({ nullable: true })
    productId?: string;
}
