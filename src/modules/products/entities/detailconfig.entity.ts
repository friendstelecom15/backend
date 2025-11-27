


import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('detailconfigs')
export class DetailConfig {
    @ObjectIdColumn()
    id: ObjectId;

    @Column({ nullable: true })
    refId?: number;

    @Column()
    label: string;

    @Column()
    value: string;

    @Column()
    productId: string;
}
