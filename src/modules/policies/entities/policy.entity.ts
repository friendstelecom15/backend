import { Entity, ObjectIdColumn, Column, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

@Entity('policypages')
export class PolicyPage {
    @ObjectIdColumn()
    id: ObjectId;

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
