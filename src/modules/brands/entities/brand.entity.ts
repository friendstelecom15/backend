import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('brands')
export class Brand {
    @ObjectIdColumn()
    id: ObjectId;

    @Column({ unique: true })
    name: string;

    @Column({ unique: true })
    slug: string;

    @Column({ nullable: true })
    logo?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
