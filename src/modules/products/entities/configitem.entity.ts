import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('configitems')
export class ConfigItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    refId?: number;

    @Column()
    label: string;

    @Column()
    price: number;

    @Column({ default: true })
    inStock: boolean;

    @Column({ nullable: true })
    cpuCoreProductId?: string;

    @Column({ nullable: true })
    gpuCoreProductId?: string;

    @Column({ nullable: true })
    ramProductId?: string;

    @Column({ nullable: true })
    displayProductId?: string;
}
