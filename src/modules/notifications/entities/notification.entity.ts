import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

export enum NotificationType {
    ORDER_UPDATE = 'ORDER_UPDATE',
    PROMOTION = 'PROMOTION',
    GIVEAWAY = 'GIVEAWAY',
    SYSTEM = 'SYSTEM',
}

@Entity('notifications')
export class Notification {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    userId: string;

    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;

    @Column()
    title: string;

    @Column()
    message: string;

    @Column({ nullable: true })
    link?: string;

    @Column({ default: false })
    read: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
