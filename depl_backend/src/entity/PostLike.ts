import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToOne,
  } from 'typeorm';
import Post from './Post';
import User from './User';
  
  @Entity('post_likes', {
    synchronize: false,
  })
  export default class PostLike {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column('uuid')
    fk_post_id!: string;
  
    @Column('uuid')
    fk_user_id!: string;
    
    @OneToOne(type => User)
    @JoinColumn({ name: 'fk_user_id' })
    user!: User;
    
    @Column('timestampz')
    @CreateDateColumn()
    created_at!: Date;
  
    @ManyToOne((type) => Post, (post) => post.likes)
    @JoinColumn({ name: 'fk_post_id' })
    post!: Post;
  }
  