import { Entity, ObjectIdColumn, Column, CreateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('giveawayentries')
export class GiveawayEntry {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    name: string;

    @Column()
    phone: string;

    @Column({ nullable: true })
    email?: string;

    @Column({ nullable: true })
    facebook?: string;

    @CreateDateColumn()
    createdAt: Date;
}
