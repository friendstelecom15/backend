

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('colorimageconfigitems')
export class ColorImageConfigItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

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
