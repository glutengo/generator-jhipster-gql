import { Authority } from '@/shared/security/authority';
/* tslint:disable */
// prettier-ignore

// prettier-ignore
const Post = () => import('@/entities/post/post.vue');
// prettier-ignore
const PostUpdate = () => import('@/entities/post/post-update.vue');
// prettier-ignore
const PostDetails = () => import('@/entities/post/post-details.vue');
// jhipster-needle-add-entity-to-router-import - JHipster will import entities to the router here

export default [
  {
    path: '/post',
    name: 'Post',
    component: Post,
    meta: { authorities: [Authority.USER] },
  },
  {
    path: '/post/new',
    name: 'PostCreate',
    component: PostUpdate,
    meta: { authorities: [Authority.USER] },
  },
  {
    path: '/post/:postId/edit',
    name: 'PostEdit',
    component: PostUpdate,
    meta: { authorities: [Authority.USER] },
  },
  {
    path: '/post/:postId/view',
    name: 'PostView',
    component: PostDetails,
    meta: { authorities: [Authority.USER] },
  },
  // jhipster-needle-add-entity-to-router - JHipster will add entities to the router here
];
