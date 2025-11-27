

import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('imageconfigs')
export class ImageConfig {
    @ObjectIdColumn()
    id: ObjectId;

    @Column({ nullable: true })
    refId?: number;

    @Column({ nullable: true })
    colorHex?: string;

    @Column({ nullable: true })
    colorName?: string;

    @Column({ nullable: true })
    image?: string;

    @Column({ default: false })
    inStock: boolean;

    @Column({ nullable: true })
    productId?: string;
}
