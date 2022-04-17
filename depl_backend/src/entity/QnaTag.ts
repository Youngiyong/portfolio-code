import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    UpdateDateColumn,
    CreateDateColumn,
    OneToMany,
    JoinColumn,
    ManyToOne,
    OneToOne,
  } from 'typeorm';
import Qna from './Qnas';
import Tag from './Tag';
  
  @Entity('qna_tags', {
    synchronize: false,
  })
  export default class QnaTag {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column('uuid')
    fk_qna_id!: string;
  
    @Column('uuid')
    fk_tag_id!: string;

    @Column('timestampz')
    @CreateDateColumn()
    created_at!: Date;
  
    @Column('timestamptz')
    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne((type) => Qna, (qna) => qna.tags)
    @JoinColumn({ name: 'fk_qna_id' })
    qna!: Qna;

    @OneToOne(type => Tag)
    @JoinColumn({ name: 'fk_tag_id' })
    tag!: Tag;

  }
  