import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('reviews')
export class Review {
    @ObjectIdColumn()
    id: ObjectId;

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
