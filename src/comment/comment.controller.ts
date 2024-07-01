import { Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { PrismaClient } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { Roles } from 'src/decorators/role/roles.decorator';
import { ROLE_LEVEL } from 'ultil/types';
import { ResourceInfo } from 'src/decorators/resource-info/resource-info.decorator';
import { CompositeGuardMixin } from 'src/guards/composite/composite.guard';
import { OwnerGuard } from 'src/guards/owner/owner.guard';
import { RoleGuard } from 'src/guards/role/role.guard';
import { CompositeGuardDecorator } from 'src/decorators/composite-guard/composite-guard.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('comment')
@ApiTags("Comment")
export class CommentController {
  constructor(private readonly commentService: CommentService) { }
  prisma = new PrismaClient();

  @Get("/gig/:id(\\d+)")
  getCommentsByGigId(@Param("id", ParseIntPipe) id: number) {
    return id;
  }

  @ApiBearerAuth("access-token")
  @UseGuards(JwtGuard, ThrottlerGuard)
  @Post("/gig/:id(\\d+)")
  postCommentInGigId(@Param("id", ParseIntPipe) id: number) {
    return id;
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Need permission Owner or admin to access" })
  @UseGuards(JwtGuard, CompositeGuardMixin())
  @CompositeGuardDecorator(OwnerGuard, RoleGuard)
  @Roles(ROLE_LEVEL.ADMIN)
  @ResourceInfo({
    table: "gig-comments_users",
    field: "user_id"
  })
  @Delete("/:id(\\d+)")
  deleteComment(@Param("id", ParseIntPipe) id: number) {
    return id;
  }
}
