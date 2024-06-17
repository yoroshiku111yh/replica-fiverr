import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { GigCatesService } from './gig-cates.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/guards/role/role.guard';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { Roles } from 'src/decorators/role/roles.decorator';
import { ROLE_LEVEL } from 'ultil/types';
import { SubGigCateDto } from './dto/sub-cate.dto';
import { CompressImagePipe, ImageCompressed } from 'src/pipes/compress-images/compress-images.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@ApiTags("gig categories [Role : ADMIN]")
@Controller('gig-cates')
export class GigCatesController {
  constructor(private readonly gigCatesService: GigCatesService) { }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Need role admin to access" })
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(ROLE_LEVEL.ADMIN)
  @Post("")
  postCates(@Body() data: string[]) {
    return this.gigCatesService.postCategories(data);
  }

  @Get("")
  getAllCates() {
    return this.gigCatesService.getCategories();
  }

  @Get("/:id(\\d+)/sub-categories")
  getAllSubCateByIdCate(@Param("id", ParseIntPipe) id: number) {
    return this.gigCatesService.getAllSubCateByIdCate(id);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Need role admin to access" })
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(ROLE_LEVEL.ADMIN)
  @Post("/:id(\\d+)/sub-category")
  postSubCategory(@Body() data: SubGigCateDto, @Param("id", ParseIntPipe) id: number) {
    return this.gigCatesService.postSubCategory(data, id);
  }

  @Get("/sub-categories/search")
  @ApiQuery({ name: 'search', required: true, description: 'keyword sub categories' })
  searchSubCateByName(@Query("search") search: string) {
    return this.gigCatesService.searchSubCateByName(search);
  }

  @Get("/search")
  @ApiQuery({ name: 'search', required: true, description: 'keyword root categories' })
  searchRootCateByName(@Query("search") search: string) {
    return this.gigCatesService.searchRootCateByName(search);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Need role admin to access" })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          example: 1,
          description: 'The ID number'
        }
      },
      required: ['id']
    }
  })
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(ROLE_LEVEL.ADMIN)
  @Delete("")
  deleteRootCate(@Body() body: { id: number }) {
    return this.gigCatesService.deleteRootCate(body.id);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Need role admin to access" })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          example: 1,
          description: 'The ID number'
        }
      },
      required: ['id']
    }
  })
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(ROLE_LEVEL.ADMIN)
  @Delete("/sub-categories")
  deleteSubCate(@Body() body: { id: number }) {
    return this.gigCatesService.deleteSubCate(body.id);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Need role admin to access" })
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(ROLE_LEVEL.ADMIN)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageCate: {
          type: 'string',
          format: 'binary',
          description: 'sub category image file'
        },
      },
    },
  })
  @Post("/sub-categories/:id(\\d+)/upload-image")
  @UseInterceptors(FileInterceptor("imageCate", {
    storage: memoryStorage(),
    limits: {
      fileSize: 2 * 10e6 // 2mb in byte
    }
  }))
  uploadImage(@UploadedFile(CompressImagePipe) imageCate: ImageCompressed[], @Param("id", ParseIntPipe) id : number) {
    if (imageCate)
      return this.gigCatesService.postSubCategoryImage(id, imageCate[0]);
    else
      throw new HttpException("please upload file image below 2mb", HttpStatus.NOT_ACCEPTABLE);
  }
}
