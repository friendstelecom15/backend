
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('productvariants')
export class ProductVariant {
    @ObjectIdColumn()
    id: ObjectId;

    @Column({ nullable: true })
    color?: string;

    @Column({ nullable: true })
    storage?: string;

    @Column({ nullable: true })
    ram?: string;

    @Column({ nullable: true })
    sim?: string;

    @Column()
    price: number;

    @Column({ default: true })
    inStock: boolean;

    @Column({ nullable: true })
    sku?: string;

    @Column()
    productId: string;

    @Column({ nullable: true })
    seoTitle?: string;

    @Column({ nullable: true })
    seoDescription?: string;

    @Column({ type: 'array', default: [] })
    seoKeywords: string[];
}
