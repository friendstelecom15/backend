import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('specifications')
export class Specification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    key: string;

    @Column()
    value: string;

    @Column()
    productId: string;
}
