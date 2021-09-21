import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPost, getPostIdentifier } from '../post.model';

export type EntityResponseType = HttpResponse<IPost>;
export type EntityArrayResponseType = HttpResponse<IPost[]>;

@Injectable({ providedIn: 'root' })
export class PostService {
  public resourceUrl = this.applicationConfigService.getEndpointFor('api/posts');

  constructor(protected http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  create(post: IPost): Observable<EntityResponseType> {
    return this.http.post<IPost>(this.resourceUrl, post, { observe: 'response' });
  }

  update(post: IPost): Observable<EntityResponseType> {
    return this.http.put<IPost>(`${this.resourceUrl}/${getPostIdentifier(post) as number}`, post, { observe: 'response' });
  }

  partialUpdate(post: IPost): Observable<EntityResponseType> {
    return this.http.patch<IPost>(`${this.resourceUrl}/${getPostIdentifier(post) as number}`, post, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IPost>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IPost[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addPostToCollectionIfMissing(postCollection: IPost[], ...postsToCheck: (IPost | null | undefined)[]): IPost[] {
    const posts: IPost[] = postsToCheck.filter(isPresent);
    if (posts.length > 0) {
      const postCollectionIdentifiers = postCollection.map(postItem => getPostIdentifier(postItem)!);
      const postsToAdd = posts.filter(postItem => {
        const postIdentifier = getPostIdentifier(postItem);
        if (postIdentifier == null || postCollectionIdentifiers.includes(postIdentifier)) {
          return false;
        }
        postCollectionIdentifiers.push(postIdentifier);
        return true;
      });
      return [...postsToAdd, ...postCollection];
    }
    return postCollection;
  }
}
