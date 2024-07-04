import { Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards, Body, Request } from '@nestjs/common';
import { CommentService } from './comment.service';
import { PrismaClient } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { Roles } from 'src/decorators/role/roles.decorator';
import { ROLE_LEVEL, RequestWithUser } from 'ultil/types';
import { ResourceInfo } from 'src/decorators/resource-info/resource-info.decorator';
import { CompositeGuardMixin } from 'src/guards/composite/composite.guard';
import { OwnerGuard } from 'src/guards/owner/owner.guard';
import { RoleGuard } from 'src/guards/role/role.guard';
import { CompositeGuardDecorator } from 'src/decorators/composite-guard/composite-guard.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PostCommentDto } from './dto/post-comment.dto';
import { TokenPayload } from 'src/auth/dto/token.dto';

@Controller('comment')
@ApiTags("Comment")
export class CommentController {
  constructor(private readonly commentService: CommentService) { }
  prisma = new PrismaClient();

  @ApiQuery({ name: 'page', required: true, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: true, type: Number, description: 'Number of users per page', example: 10 })
  @Get("/gig/:id(\\d+)")
  getCommentsByGigId(@Param("id", ParseIntPipe) id: number,
    @Query("limit", ParseIntPipe) limit: number,
    @Query("page", ParseIntPipe) page: number) {
    return this.commentService.getCommentByGigId({ index: page, size: limit }, id);
  }

  @ApiBearerAuth("access-token")
  @UseGuards(JwtGuard, ThrottlerGuard)
  @Post("/gig/:id(\\d+)")
  postCommentInGigId(@Param("id", ParseIntPipe) id: number, @Body() data: PostCommentDto, @Request() req: RequestWithUser<TokenPayload>) {
    return this.commentService.postComment(id, data, req.user.id);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Need permission Owner or admin to access" })
  @UseGuards(JwtGuard, CompositeGuardMixin())
  @CompositeGuardDecorator(OwnerGuard, RoleGuard)
  @Roles(ROLE_LEVEL.ADMIN)
  @ResourceInfo({
    table: "gig_comments",
    field: "user_id"
  })
  @Delete("/:id(\\d+)")
  hiddenComment(@Param("id", ParseIntPipe) id: number) {
    return this.commentService.hiddenComment(id);
  }
}
