

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('storageconfigs')
export class StorageConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

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
