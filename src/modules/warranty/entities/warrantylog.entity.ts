import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('warrantylogs')
export class WarrantyLog {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    warrantyId: string;

    @Column()
    action: string;

    @Column({ type: 'json', nullable: true })
    changes?: any;

    @Column({ nullable: true })
    admin?: string;

    @CreateDateColumn()
    createdAt: Date;
}
