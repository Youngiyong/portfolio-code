import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    ManyToOne,
    OneToOne,
  } from 'typeorm';
import Qna from './Qnas';
import User from './User';
  
  @Entity('qna_comments', {
    synchronize: false,
  })
  export default class QnaComment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column('uuid')
    fk_qna_id!: string;
  
    @Column('uuid')
    fk_user_id!: string;

    @OneToOne(type => User)
    @JoinColumn({ name: 'fk_user_id' })
    comment_user!: User;

    @Column('text')
    text!: string;

    @Column({ default: false })
    is_private!: boolean;


    @Column({ default: false })
    is_reply!: boolean;

    @Column('uuid')
    reply_to!: string;

    @Column()
    level!: number;

    @Column('timestampz')
    @CreateDateColumn()
    created_at!: Date;

    @Column('timestamptz')
    @UpdateDateColumn()
    updated_at!: Date;

    @Column('timestamptz')
    deleted_at!: Date;

    @ManyToOne((type) => Qna, (qna) => qna.comments)
    @JoinColumn({ name: 'fk_qna_id' })
    qna!: Qna;

  }
  