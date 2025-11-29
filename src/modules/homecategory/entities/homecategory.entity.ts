import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// import { Category } from '../../categories/entities/category.entity';
// import { Product } from '../../products/entities/product.entity';
import { ObjectId } from 'mongodb';

@Entity('homecategories')
export class HomeCategory {
    @ObjectIdColumn()
    id: ObjectId;

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
