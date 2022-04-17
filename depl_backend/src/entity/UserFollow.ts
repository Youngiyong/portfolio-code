import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToOne,
    JoinColumn
  } from 'typeorm';
  import User from './User';
  
  @Entity('user_follows', {
    synchronize: false
  })
  export default class UserFollow {
    
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column('timestampz')
    @CreateDateColumn()
    created_at!: Date;
  
    @Column({select: false, type: 'uuid' })
    fk_user_id!: string;


    @Column({select: false,  type: 'uuid' })
    fk_follow_user_id!: string;

    @OneToOne(type => User)
    @JoinColumn({ name: 'fk_user_id' })
    follower_user!: User;

    @OneToOne(type => User)
    @JoinColumn({ name: 'fk_follow_user_id' })
    follow_user!: User;
  }
  