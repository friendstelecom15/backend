import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ProductCare } from '../../products/entities/product.care.entity';
import { ObjectId } from 'mongodb';

import { Subcategory } from './subcategory.entity';
// import { HomeCategory } from '../../homecategory/entities/homecategory.entity';

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
    priority?: number;



    @Column({ nullable: true })
    homeCategoryId?: string;

    // Brand association: which brand this category belongs to
    @Column({ nullable: true })
    brandsId?: string;


    @OneToMany(() => Subcategory, subcategory => subcategory.categoryId)
    subcategories?: Subcategory[];


    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
