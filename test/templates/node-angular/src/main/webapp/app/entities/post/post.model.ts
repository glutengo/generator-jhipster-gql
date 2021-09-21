import { IUser } from 'app/entities/user/user.model';

export interface IPost {
  id?: number;
  title?: string | null;
  content?: string | null;
  coverImageUrl?: string | null;
  author?: IUser | null;
}

export class Post implements IPost {
  constructor(
    public id?: number,
    public title?: string | null,
    public content?: string | null,
    public coverImageUrl?: string | null,
    public author?: IUser | null
  ) {}
}

export function getPostIdentifier(post: IPost): number | undefined {
  return post.id;
}
