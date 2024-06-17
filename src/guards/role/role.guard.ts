import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import { TokenPayload } from 'src/auth/dto/token.dto';
import { NAME_ROLE_DECORATOR } from 'src/decorators/role/roles.decorator';
import { ROLE_LEVEL } from 'ultil/types';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }
  prisma = new PrismaClient();
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const roles = this.reflector.get<string[]>(NAME_ROLE_DECORATOR, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const payload: TokenPayload = request.user;
    if (!payload) {
      throw new UnauthorizedException();
    }
    const user = await this.prisma.users.findUnique({
      where: {
        id: payload.id
      },
      include: {
        roles: true
      }
    });
    if (user) {
      const roleUser = user.roles.name_role;
      if (roles.includes(roleUser)) {
        return true;
      }
    }

    throw new UnauthorizedException();
  }
}
