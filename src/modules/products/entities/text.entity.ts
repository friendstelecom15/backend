import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('texts')
export class Text {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    text: string;
}
