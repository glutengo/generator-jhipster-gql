/* eslint-disable @typescript-eslint/no-unused-vars */
import { Entity, Column, JoinColumn, OneToOne, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from './base/base.entity';

import { User } from './user.entity';

/**
 * A Post.
 */
@Entity('post')
export class Post extends BaseEntity {
  @Column({ name: 'title', nullable: true })
  title: string;

  @Column({ name: 'content', nullable: true })
  content: string;

  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl: string;

  @ManyToOne(type => User)
  author: User;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
