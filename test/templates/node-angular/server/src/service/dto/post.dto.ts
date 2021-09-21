/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiModelProperty } from '@nestjs/swagger';
import { BaseDTO } from './base.dto';

import { UserDTO } from './user.dto';

/**
 * A PostDTO object.
 */
export class PostDTO extends BaseDTO {
  @ApiModelProperty({ description: 'title field', required: false })
  title: string;

  @ApiModelProperty({ description: 'content field', required: false })
  content: string;

  @ApiModelProperty({ description: 'coverImageUrl field', required: false })
  coverImageUrl: string;

  @ApiModelProperty({ type: UserDTO, description: 'author relationship' })
  author: UserDTO;

  // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
}
