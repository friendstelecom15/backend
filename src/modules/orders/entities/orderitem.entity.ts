import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('orderitems')
export class OrderItem {
    @ObjectIdColumn()
    id: ObjectId;

    @Column({ nullable: true })
    productName?: string;

    @Column({ nullable: true })
    price?: number;

    @Column({ default: 1 })
    quantity: number;

    @Column({ nullable: true })
    color?: string;

    @Column({ nullable: true })
    storage?: string;

    @Column({ nullable: true })
    RAM?: string;

    @Column({ nullable: true })
    sim?: string;

    @Column({ nullable: true })
    display?: string;

    @Column({ nullable: true })
    region?: string;

    @Column({ nullable: true })
    image?: string;

    @Column({ type: 'json', nullable: true })
    dynamicInputs?: any;

    @Column()
    orderId: string;

    @Column({ nullable: true })
    productId?: string;
}
