import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PostDTO } from '../service/dto/post.dto';
import { PostMapper } from '../service/mapper/post.mapper';
import { PostRepository } from '../repository/post.repository';

const relationshipNames = [];
relationshipNames.push('author');

@Injectable()
export class PostService {
  logger = new Logger('PostService');

  constructor(@InjectRepository(PostRepository) private postRepository: PostRepository) {}

  async findById(id: number): Promise<PostDTO | undefined> {
    const options = { relations: relationshipNames };
    const result = await this.postRepository.findOne(id, options);
    return PostMapper.fromEntityToDTO(result);
  }

  async findByFields(options: FindOneOptions<PostDTO>): Promise<PostDTO | undefined> {
    const result = await this.postRepository.findOne(options);
    return PostMapper.fromEntityToDTO(result);
  }

  async findAndCount(options: FindManyOptions<PostDTO>): Promise<[PostDTO[], number]> {
    options.relations = relationshipNames;
    const resultList = await this.postRepository.findAndCount(options);
    const postDTO: PostDTO[] = [];
    if (resultList && resultList[0]) {
      resultList[0].forEach(post => postDTO.push(PostMapper.fromEntityToDTO(post)));
      resultList[0] = postDTO;
    }
    return resultList;
  }

  async save(postDTO: PostDTO, creator?: string): Promise<PostDTO | undefined> {
    const entity = PostMapper.fromDTOtoEntity(postDTO);
    if (creator) {
      if (!entity.createdBy) {
        entity.createdBy = creator;
      }
      entity.lastModifiedBy = creator;
    }
    const result = await this.postRepository.save(entity);
    return PostMapper.fromEntityToDTO(result);
  }

  async update(postDTO: PostDTO, updater?: string): Promise<PostDTO | undefined> {
    const entity = PostMapper.fromDTOtoEntity(postDTO);
    if (updater) {
      entity.lastModifiedBy = updater;
    }
    const result = await this.postRepository.save(entity);
    return PostMapper.fromEntityToDTO(result);
  }

  async deleteById(id: number): Promise<void | undefined> {
    await this.postRepository.delete(id);
    const entityFind = await this.findById(id);
    if (entityFind) {
      throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
    }
    return;
  }
}
