import { SetMetadata } from '@nestjs/common';

export interface TypeDataResourceInfo {
    table : string,
    field : string
}

export const NAME_RESOURCE_INFO_DECORATOR = 'resource-info';

export const ResourceInfo = (args: TypeDataResourceInfo) => SetMetadata(NAME_RESOURCE_INFO_DECORATOR, args);
