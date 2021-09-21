import { IUser } from 'app/shared/model/user.model';

export interface IPost {
  id?: number;
  title?: string | null;
  content?: string | null;
  coverImageUrl?: string | null;
  author?: IUser | null;
}

export const defaultValue: Readonly<IPost> = {};
