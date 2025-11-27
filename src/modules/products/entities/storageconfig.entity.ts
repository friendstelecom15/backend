

import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('storageconfigs')
export class StorageConfig {
    @ObjectIdColumn()
    id: ObjectId;

    @Column({ nullable: true })
    refId?: number;

    @Column({ nullable: true })
    basicPrice?: number;

    @Column({ type: 'json', nullable: true })
    colorStocks?: any;

    @Column({ default: false })
    inStock: boolean;

    @Column({ nullable: true })
    name?: string;

    @Column({ type: 'json', nullable: true })
    prices?: any;

    @Column({ nullable: true })
    shortDetails?: string;

    @Column()
    productId: string;
}
