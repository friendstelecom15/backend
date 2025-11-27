import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('faqs')
export class FAQ {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    question: string;

    @Column()
    answer: string;

    @Column({ nullable: true })
    productId?: string;

    @CreateDateColumn()
    createdAt: Date;
}
