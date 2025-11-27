import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('simconfigs')
export class SimConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    name?: string;

    @Column({ nullable: true })
    details?: string;

    @Column()
    productId: string;
}
