



import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('pricehistories')
export class PriceHistory {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    productId: string;

    @Column()
    oldPrice: number;

    @Column()
    newPrice: number;

    @CreateDateColumn()
    changedAt: Date;
}
