import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToOne,
  } from 'typeorm';
import Qna from './Qnas';
import User from './User';
  
  @Entity('qna_likes', {
    synchronize: false,
  })
  export default class QnaLike {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column('uuid')
    fk_qna_id!: string;
  
    @Column('uuid')
    fk_user_id!: string;

    @OneToOne(type => User)
    @JoinColumn({ name: 'fk_user_id' })
    user!: User;

    @Column('timestampz')
    @CreateDateColumn()
    created_at!: Date;
  
    @ManyToOne((type) => Qna, (qna) => qna.likes)
    @JoinColumn({ name: 'fk_qna_id' })
    qna!: Qna;
  }
  