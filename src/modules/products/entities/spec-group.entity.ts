import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ObjectId } from 'mongodb';
import { ProductSpecification } from './product-specification.entity';

@Entity('spec_groups')
export class SpecGroup {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ unique: true })
  groupName: string;

  @Column({ default: 0 })
  displayOrder: number;

  @Column({ nullable: true })
  icon?: string;

  // Relations
  @OneToMany(() => ProductSpecification, (spec) => spec.specGroup)
  specifications: ProductSpecification[];

  @CreateDateColumn()
  createdAt: Date;
}
