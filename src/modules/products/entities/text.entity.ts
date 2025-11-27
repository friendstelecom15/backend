import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('texts')
export class Text {
    @ObjectIdColumn()
    id: ObjectId;

    @Column()
    text: string;
}
