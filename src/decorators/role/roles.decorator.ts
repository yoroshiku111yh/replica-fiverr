import { SetMetadata } from '@nestjs/common';

export const NAME_ROLE_DECORATOR = 'roles';

export const Roles = (...args: string[]) => SetMetadata(NAME_ROLE_DECORATOR, args);
