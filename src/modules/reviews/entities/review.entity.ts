import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    productId: string;

    @Column()
    rating: number;

    @Column({ nullable: true })
    comment?: string;

    @CreateDateColumn()
    createdAt: Date;
}
