import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('configitems')
export class ConfigItem {
    @ObjectIdColumn()
    id: ObjectId;

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
