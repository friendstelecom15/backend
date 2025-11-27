import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('categories')
export class Category {
    @ObjectIdColumn()
    id: ObjectId;

    @Column({ unique: true })
    name: string;

    @Column({ unique: true, nullable: true })
    slug?: string;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    banner?: string;

    @Column({ nullable: true })
    icon?: string;

    @Column({ nullable: true })
    priority?: number;

    @Column({ nullable: true })
    homeCategoryId?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
