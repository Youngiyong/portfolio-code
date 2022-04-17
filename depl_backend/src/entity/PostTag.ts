import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    UpdateDateColumn,
    CreateDateColumn,
    JoinColumn,
    ManyToOne,
    OneToOne,
  } from 'typeorm';
import Post from './Post';
import Tag from './Tag';
  
  @Entity('post_tags', {
    synchronize: false,
  })
  export default class PostTag {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column('uuid')
    fk_post_id!: string;
  
    @Column('uuid')
    fk_tag_id!: string;

    @Column('timestampz')
    @CreateDateColumn()
    created_at!: Date;
  
    @Column('timestamptz')
    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne((type) => Post, (post) => post.tags)
    @JoinColumn({ name: 'fk_post_id' })
    post!: Post;

    @OneToOne(type => Tag)
    @JoinColumn({ name: 'fk_tag_id' })
    tag!: Tag;
  }
  