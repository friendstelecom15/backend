

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('imageconfigs')
export class ImageConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

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
