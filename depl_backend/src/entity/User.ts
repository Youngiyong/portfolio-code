
import { Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    Unique,
    CreateDateColumn,
    UpdateDateColumn,
    getRepository,
    OneToOne,
    OneToMany
  } from 'typeorm';
import { generateAccessToken, generateRefreshToken } from '../lib/token';
import Qna from './Qnas';
import UserProfile from './UserProfile';

@Entity('users', {
  synchronize: false
})
  
export default class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  
  @Index()
  @Column({ unique: true, length: 255 })
  username!: string;
  
  @Index()
  @Column({ unique: true, length: 255, nullable: true, type: 'varchar' })
  email!: string | null;
  
  @Column({select: false, length: 255, nullable: true, type: 'varchar' })
  password!: string;

  @Column('timestampz')
  @CreateDateColumn()
  created_at!: Date;
  
  @Column('timestamptz')
  @UpdateDateColumn()
  updated_at!: Date;
  
  @Column({ default: false })
  is_certified!: boolean;
  
  @OneToOne(type => UserProfile, profile => profile.user)
  profile!: UserProfile;

  async generateUserToken() {
    // refresh token is valid for 30days
    const accessToken = await generateAccessToken(this.id);
    const refreshToken = await generateRefreshToken(this.id);
    return {
      refreshToken,
      accessToken
    };
  }
  

}
  