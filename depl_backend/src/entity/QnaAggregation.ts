import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
  } from 'typeorm';
import Qna from './Qnas';
  
  @Entity('qna_aggregations', {
    synchronize: false,
  })
  export default class QnaAggregation {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column('uuid')
    fk_qna_id!: string;
  
    @Column()
    views!: number;

    @Column()
    likes!: number;

    @Column('timestampz')
    @CreateDateColumn()
    created_at!: Date;

    @Column('timestamptz')
    @UpdateDateColumn()
    updated_at!: Date;

    @OneToOne(type => Qna)
    @JoinColumn({ name: 'fk_qna_id' })
    qna!: Qna;
  
  }
  