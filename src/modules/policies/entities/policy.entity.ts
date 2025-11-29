import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('policypages')
export class PolicyPage {
    @ObjectIdColumn()
    id: ObjectId;

    @Column({ unique: true })
    slug: string;

    @Column()
    title: string;

    @Column()
    type: string;


    @Column({ default: 0 })
    orderIndex: number;

    @Column({ default: false })
    isPublished: boolean;

    @Column({ nullable: true })
    content?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}