import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('preorderconfigs')
export class PreOrderConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: false })
    enabled: boolean;

    @Column({ nullable: true })
    expectedDate?: Date;

    @Column({ nullable: true })
    note?: string;

    @Column({ unique: true, nullable: true })
    productId?: string;
}
