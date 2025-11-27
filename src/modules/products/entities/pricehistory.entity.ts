



import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('pricehistories')
export class PriceHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    productId: string;

    @Column()
    oldPrice: number;

    @Column()
    newPrice: number;

    @CreateDateColumn()
    changedAt: Date;
}
