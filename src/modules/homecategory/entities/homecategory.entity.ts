import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('homecategories')
export class HomeCategory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;


    @Column({ nullable: true })
    priority?: number;

    @Column({ type: 'array', nullable: true })
    categoryIds?: string[];

    @Column({ type: 'array', nullable: true })
    productIds?: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
