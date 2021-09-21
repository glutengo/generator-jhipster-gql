import { Post } from '../../domain/post.entity';
import { PostDTO } from '../dto/post.dto';

/**
 * A Post mapper object.
 */
export class PostMapper {
  static fromDTOtoEntity(entityDTO: PostDTO): Post {
    if (!entityDTO) {
      return;
    }
    let entity = new Post();
    const fields = Object.getOwnPropertyNames(entityDTO);
    fields.forEach(field => {
      entity[field] = entityDTO[field];
    });
    return entity;
  }

  static fromEntityToDTO(entity: Post): PostDTO {
    if (!entity) {
      return;
    }
    let entityDTO = new PostDTO();

    const fields = Object.getOwnPropertyNames(entity);

    fields.forEach(field => {
      entityDTO[field] = entity[field];
    });

    return entityDTO;
  }
}
