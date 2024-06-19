import { TokenPayload } from './../auth/dto/token.dto';
import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Req, ForbiddenException, HttpException, HttpStatus, Get, Param, ParseIntPipe, Query, Put, Body, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CompressImagePipe, ImageCompressed } from 'src/pipes/compress-images/compress-images.pipe';
import { ROLE_LEVEL, RequestWithUser } from 'ultil/types';
import { CompositeGuardMixin } from 'src/guards/composite/composite.guard';
import { CompositeGuardDecorator } from 'src/decorators/composite-guard/composite-guard.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { OwnerGuard } from 'src/guards/owner/owner.guard';
import { ResourceInfo } from 'src/decorators/resource-info/resource-info.decorator';
import { Roles } from 'src/decorators/role/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags("Users")
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiBearerAuth("access-token")
  @UseGuards(JwtGuard)
  @Get("")
  getProfile(@Req() req: RequestWithUser<TokenPayload>) {
    return this.usersService.getProfile(req.user.id)
  }

  @Get("/:id(\\d+)")
  getProfileById(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.getProfile(id);
  }

  @Get("/:id(\\d+)/skills")
  getSkills(@Param("id", ParseIntPipe) id : number){
    return this.usersService.getSkills(id);
  }

  @ApiBearerAuth("access-token")
  @UseGuards(JwtGuard, OwnerGuard)
  @ResourceInfo({
    table: "users",
    field: "id"
  })
  @Put("/:resourceId(\\d+)")
  updateInfoUser(@Param("resourceId", ParseIntPipe) resourceId: number, @Body() data: UpdateUserDto) {
    return this.usersService.editProfile(data, resourceId);
  }

  @ApiBearerAuth("access-token")
  @UseGuards(JwtGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file'
        },
      },
    },
  })
  @Post("/upload-avatar")
  @UseInterceptors(FileInterceptor("avatar", {
    storage: memoryStorage(),
    limits: {
      fileSize: 5 * 10e6 // 5mb in byte
    }
  }))
  uploadAvatar(@UploadedFile(CompressImagePipe) avatar: ImageCompressed[], @Req() req: RequestWithUser<TokenPayload>) {
    const payload = req.user;
    if (avatar)
      return this.usersService.uploadAvatar(avatar[0], payload.id);
    else
      throw new HttpException("please upload file image below 5mb", HttpStatus.NOT_ACCEPTABLE);
  }

  @ApiQuery({ name: 'search', required: true, description: 'Username to search for' })
  @ApiQuery({ name: 'page', required: true, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: true, type: Number, description: 'Number of users per page', example: 10 })
  @Get("/search")
  searchByName(
    @Query("search") username: string,
    @Query("limit", ParseIntPipe) limit: number,
    @Query("page", ParseIntPipe) page: number
  ) {
    return this.usersService.searchByName(username, { size: limit, index: page });
  }

  @Get("/:id(\\d+)/certifications")
  getCertifications(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.getCertifications(id);
  }

  @ApiBearerAuth("access-token")
  @UseGuards(JwtGuard, OwnerGuard)
  @ResourceInfo({
    table: "certification",
    field: "user_id"
  })
  @Delete("/certifications/:resourceId(\\d+)")
  deleteCertifications(@Param("resourceId", ParseIntPipe) resourceId: number) {
    return this.usersService.deleteCertification(resourceId);
  }

  @ApiBearerAuth("access-token")
  @UseGuards(JwtGuard)
  @Post("/certifications")
  postCertifications(@Body() data: string[], @Req() req: RequestWithUser<TokenPayload>) {
    const payload = req.user;
    return this.usersService.postCertifications(data, payload.id);
  }

  @ApiQuery({ name: 'page', required: true, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: true, type: Number, description: 'Number of users per page', example: 10 })
  @Get("/:id(\\d+)/gigs")
  getGigsByUserId(@Param("id", ParseIntPipe)id : number, @Query("page", ParseIntPipe) page : number, @Query("limit", ParseIntPipe) limit : number){
    return id;
  }
}

