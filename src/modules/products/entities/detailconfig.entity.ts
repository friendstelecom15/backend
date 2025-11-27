


import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('detailconfigs')
export class DetailConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    refId?: number;

    @Column()
    label: string;

    @Column()
    value: string;

    @Column()
    productId: string;
}
