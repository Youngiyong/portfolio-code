import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  getRepository
} from 'typeorm';
import User from './User';

@Entity('user_profiles', {
  synchronize: false
})

export default class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ length: 255 })
  description!: string;

  @Column({ length: 255, nullable: true, type: 'varchar' })
  thumbnail!: string | null;

  @Column('timestampz')
  @CreateDateColumn()
  created_at!: Date;

  @Column('timestamptz')
  @UpdateDateColumn()
  updated_at!: Date;

  @OneToOne(type => User)
  @JoinColumn({ name: 'fk_user_id' })
  user!: User;

  @Column('uuid')
  fk_user_id!: string;

  @Column({
    default: {},
    type: 'jsonb'
  })
  profile_links!: any;

}

