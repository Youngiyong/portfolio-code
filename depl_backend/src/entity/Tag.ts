import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import PostTag from './PostTag';
import QnaTag from './QnaTag';

@Entity('tags', {
  synchronize: false,
})
export default class Tag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ length: 255 })
  name!: string;

  @Column('timestampz')
  @CreateDateColumn()
  created_at!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ length: 255, nullable: true, type: 'varchar' })
  description!: string | null;

  @Column({ length: 255, nullable: true, type: 'varchar' })
  thumbnail!: string | null;

  @OneToOne(type => QnaTag)
  tag!: QnaTag;

}
