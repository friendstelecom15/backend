import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: 'json', nullable: true })
    customer?: any;

    @Column({ type: 'json', nullable: true })
    orderItems?: any[];

    @Column()
    total: number;

    @Column({ nullable: true })
    productName?: string;

    @Column({ nullable: true })
    basePrice?: number;

    @Column({ nullable: true })
    quantity?: number;

    @Column({ nullable: true })
    image?: string;

    @Column({ nullable: true })
    color?: string;

    @Column({ nullable: true })
    storage?: string;

    @Column({ nullable: true })
    RAM?: string;

    @Column({ nullable: true })
    sim?: string;

    @Column({ type: 'json', nullable: true })
    dynamicInputs?: any;

    @Column({ default: 'pending' })
    status: string;

    @Column({ default: 'pending' })
    paymentStatus: string;

    @Column({ nullable: true, unique: true })
    orderNumber?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
