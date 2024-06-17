import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import { TokenPayload } from 'src/auth/dto/token.dto';
import { NAME_RESOURCE_INFO_DECORATOR, TypeDataResourceInfo } from 'src/decorators/resource-info/resource-info.decorator';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }
  prisma = new PrismaClient();
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const resourceInfo = this.reflector.get<TypeDataResourceInfo>(NAME_RESOURCE_INFO_DECORATOR, context.getHandler());
    const request = context.switchToHttp().getRequest();
    const idResourceCheckOwner = Number(request.params.resourceId);
    if (!resourceInfo || !idResourceCheckOwner) {
      return true;
    }
    const payload: TokenPayload = request.user;
    if (!payload) {
      throw new UnauthorizedException();
    }
    const user = await this.prisma.users.findUnique({
      where: {
        id: payload.id
      }
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    const resourceData = await this.prisma[resourceInfo.table].findUnique({
      where: {
        id : idResourceCheckOwner
      }
    });
    if (resourceData && resourceData[resourceInfo.field] === user.id) {
      return true;
    }
    throw new UnauthorizedException();
  }
}

