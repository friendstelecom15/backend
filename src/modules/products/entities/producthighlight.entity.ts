
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('producthighlights')
export class ProductHighlight {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    text: string;

    @Column()
    productId: string;
}
