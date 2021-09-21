import { EntityRepository, Repository } from 'typeorm';
import { Post } from '../domain/post.entity';

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {}
