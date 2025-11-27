import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('secondconfigs')
export class SecondConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    refId?: number;

    @Column()
    seconddetails: string;

    @Column()
    value: string;

    @Column()
    productId: string;
}
