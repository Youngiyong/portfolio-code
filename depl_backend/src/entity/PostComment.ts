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
import Post from './Post';
import User from './User';
  
  @Entity('post_comments', {
    synchronize: false,
  })
  export default class PostComment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column('uuid')
    fk_post_id!: string;
  
    @Column('uuid')
    fk_user_id!: string;

    @OneToOne(type => User)
    @JoinColumn({ name: 'fk_user_id' })
    comment_user!: User;
    
    @Column('text')
    text!: string;

    @Column('timestampz')
    @CreateDateColumn()
    created_at!: Date;

    @Column('timestamptz')
    @UpdateDateColumn()
    updated_at!: Date;

    @Column('timestamptz')
    deleted_at!: Date;

    @ManyToOne((type) => Post, (post) => post.comments)
    @JoinColumn({ name: 'fk_post_id' })
    post!: Post;

  }
  