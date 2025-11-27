
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('productspecs')
export class ProductSpec {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    value: string;

    @Column()
    productId: string;
}
