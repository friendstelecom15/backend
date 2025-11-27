import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('wishlists')
export class Wishlist {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    userId: string;

    @Column()
    productId: string;

    @CreateDateColumn()
    createdAt: Date;
}
