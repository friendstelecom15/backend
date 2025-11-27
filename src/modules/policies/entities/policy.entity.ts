import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('policypages')
export class PolicyPage {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ unique: true })
    slug: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    contentBn?: string;

    @Column({ nullable: true })
    contentEn?: string;

    @UpdateDateColumn()
    updatedAt: Date;
}
