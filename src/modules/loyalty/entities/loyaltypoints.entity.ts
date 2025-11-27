import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('loyaltypoints')
export class LoyaltyPoints {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    userId: string; // Store as string for compatibility with external user system

    @Column({ default: 0 })
    points: number;

    @Column({ default: 'Bronze' })
    level: string;
}
