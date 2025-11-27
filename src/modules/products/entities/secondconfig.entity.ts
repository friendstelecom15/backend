import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('secondconfigs')
export class SecondConfig {
    @ObjectIdColumn()
    id: ObjectId;

    @Column({ nullable: true })
    refId?: number;

    @Column()
    seconddetails: string;

    @Column()
    value: string;

    @Column()
    productId: string;
}
