
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('productvariants')
export class ProductVariant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

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
