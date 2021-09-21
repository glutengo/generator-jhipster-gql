import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post as PostMethod,
  Put,
  UseGuards,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiUseTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { PostDTO } from '../../service/dto/post.dto';
import { PostService } from '../../service/post.service';
import { PageRequest, Page } from '../../domain/base/pagination.entity';
import { AuthGuard, Roles, RolesGuard, RoleType } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';

@Controller('api/posts')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiUseTags('posts')
export class PostController {
  logger = new Logger('PostController');

  constructor(private readonly postService: PostService) {}

  @Get('/')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'List all records',
    type: PostDTO,
  })
  async getAll(@Req() req: Request): Promise<PostDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort);
    const [results, count] = await this.postService.findAndCount({
      skip: +pageRequest.page * pageRequest.size,
      take: +pageRequest.size,
      order: pageRequest.sort.asOrder(),
    });
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/:id')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: PostDTO,
  })
  async getOne(@Param('id') id: number): Promise<PostDTO> {
    return await this.postService.findById(id);
  }

  @PostMethod('/')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ title: 'Create post' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: PostDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async post(@Req() req: Request, @Body() postDTO: PostDTO): Promise<PostDTO> {
    const created = await this.postService.save(postDTO, req.user?.login);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Post', created.id);
    return created;
  }

  @Put('/')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ title: 'Update post' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: PostDTO,
  })
  async put(@Req() req: Request, @Body() postDTO: PostDTO): Promise<PostDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Post', postDTO.id);
    return await this.postService.update(postDTO, req.user?.login);
  }

  @Put('/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ title: 'Update post with id' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated.',
    type: PostDTO,
  })
  async putId(@Req() req: Request, @Body() postDTO: PostDTO): Promise<PostDTO> {
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Post', postDTO.id);
    return await this.postService.update(postDTO, req.user?.login);
  }

  @Delete('/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ title: 'Delete post' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void> {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'Post', id);
    return await this.postService.deleteById(id);
  }
}
