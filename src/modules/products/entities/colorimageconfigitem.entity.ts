

import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('colorimageconfigitems')
export class ColorImageConfigItem {
    @ObjectIdColumn()
    id: ObjectId;

    @Column({ nullable: true })
    refId?: number;

    @Column()
    color: string;

    @Column()
    image: string;

    @Column()
    price: number;

    @Column({ default: true })
    inStock: boolean;

    @Column()
    productId: string;
}
