import { CanActivate, SetMetadata } from '@nestjs/common';

export type TypeCompositeGuardDecorator = (new (...args: any[]) => CanActivate);
export const NAME_DECORATOR_COMPOSITE = 'composite-guard';
export const CompositeGuardDecorator = (...args: TypeCompositeGuardDecorator[]) => SetMetadata(NAME_DECORATOR_COMPOSITE, args);
