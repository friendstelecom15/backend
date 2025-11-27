import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('simconfigs')
export class SimConfig {
    @ObjectIdColumn()
    id: ObjectId;

    @Column({ nullable: true })
    name?: string;

    @Column({ nullable: true })
    details?: string;

    @Column()
    productId: string;
}
