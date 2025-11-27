import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('orderitems')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    productName?: string;

    @Column({ nullable: true })
    price?: number;

    @Column({ default: 1 })
    quantity: number;

    @Column({ nullable: true })
    color?: string;

    @Column({ nullable: true })
    storage?: string;

    @Column({ nullable: true })
    RAM?: string;

    @Column({ nullable: true })
    sim?: string;

    @Column({ nullable: true })
    display?: string;

    @Column({ nullable: true })
    region?: string;

    @Column({ nullable: true })
    image?: string;

    @Column({ type: 'json', nullable: true })
    dynamicInputs?: any;

    @Column()
    orderId: string;

    @Column({ nullable: true })
    productId?: string;
}
