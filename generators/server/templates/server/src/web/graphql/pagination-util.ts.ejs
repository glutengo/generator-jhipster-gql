import { ArgsType, Field } from '@nestjs/graphql';
import { PageRequest } from '../../domain/base/pagination.entity';
import { FindManyOptions } from 'typeorm';

@ArgsType()
export class PaginationArgs {
    @Field({ nullable: true })
    page?: number;
    @Field({ nullable: true })
    size?: number;
    @Field({ nullable: true })
    sort?: string;
}

export function pageRequestToFindManyOptions(pageRequest: PageRequest): FindManyOptions {
    return {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
    };
}
