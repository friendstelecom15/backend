import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('compares')
export class Compare {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    userId: string;

    @Column()
    productId: string;

    @CreateDateColumn()
    createdAt: Date;
}
