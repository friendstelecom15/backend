import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('faqs')
export class FAQ {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    question: string;

    @Column()
    answer: string;

    @Column({ nullable: true })
    productId?: string;

    @CreateDateColumn()
    createdAt: Date;
}
