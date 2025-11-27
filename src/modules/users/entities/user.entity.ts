import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';


@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;


    @Column()
    name: string;


    @Column({ unique: true })
    email: string;


    @Column({ nullable: true })
    phone?: string;


    @Column({ nullable: true })
    password?: string;


    @Column({ default: 'user' })
    role: string;


    @Column({ default: false })
    isAdmin: boolean;


    @Column({ nullable: true })
    image?: string;


    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
