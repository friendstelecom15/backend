import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('preorderconfigs')
export class PreOrderConfig {
    @ObjectIdColumn()
    id: ObjectId;

    @Column({ default: false })
    enabled: boolean;

    @Column({ nullable: true })
    expectedDate?: Date;

    @Column({ nullable: true })
    note?: string;

    @Column({ unique: true, nullable: true })
    productId?: string;
}
