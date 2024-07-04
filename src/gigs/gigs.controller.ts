import { BadRequestException, Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put, Query, Req, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { GigsService } from './gigs.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { UploadGigDto } from './dto/upload-gig.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CompressImagePipe, ImageCompressed } from 'src/pipes/compress-images/compress-images.pipe';
import { ROLE_LEVEL, RequestWithUser } from 'ultil/types';
import { TokenPayload } from 'src/auth/dto/token.dto';
import { OwnerGuard } from 'src/guards/owner/owner.guard';
import { ResourceInfo } from 'src/decorators/resource-info/resource-info.decorator';
import { EditGigDto } from './dto/edit-gig-dto';
import { CompositeGuardMixin } from 'src/guards/composite/composite.guard';
import { RoleGuard } from 'src/guards/role/role.guard';
import { CompositeGuardDecorator } from 'src/decorators/composite-guard/composite-guard.decorator';
import { Roles } from 'src/decorators/role/roles.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RatingDto } from 'src/gigs/dto/rating.dto';

@ApiTags("Gigs")
@Controller('gigs')
export class GigsController {
  constructor(private readonly gigsService: GigsService) { }

  @ApiBearerAuth("access-token")
  @UseGuards(JwtGuard, ThrottlerGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload Gig',
    required: true,
    type: UploadGigDto,
    schema: {
      type: 'object',
      properties: {
        imageGig: {
          type: 'string',
          format: 'binary',
          description: 'Gig image'
        }
      }
    }
  })
  @UseInterceptors(FileInterceptor("imageGig", {
    storage: memoryStorage(),
    limits: {
      fileSize: 2 * 10e6 // 2mb in byte
    }
  }))
  @Post("")
  postGig(@UploadedFile(CompressImagePipe) imageGig: ImageCompressed[], @Body() data: UploadGigDto, @Req() req: RequestWithUser<TokenPayload>) {
    const image = imageGig ? imageGig[0] : null;
    return this.gigsService.postGig(image, data, req.user.id);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Need admin to access" })
  @UseGuards(JwtGuard, RoleGuard, ThrottlerGuard)
  @Roles(ROLE_LEVEL.ADMIN)
  @ResourceInfo({
    table: "gigs",
    field: "author_id"
  })
  @Put("/:id(\\d+)")
  editGig(@Body() data: EditGigDto, @Param("id", ParseIntPipe) id: number) {
    return this.gigsService.editGig(data, id);
  }

  @ApiBearerAuth("access-token")
  @UseGuards(JwtGuard, OwnerGuard)
  @ResourceInfo({
    table: "gigs",
    field: "author_id"
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload Gig',
    required: true,
    schema: {
      type: 'object',
      properties: {
        imageGig: {
          type: 'string',
          format: 'binary',
          description: 'Gig image'
        }
      }
    }
  })
  @UseInterceptors(FileInterceptor("imageGig", {
    storage: memoryStorage(),
    limits: {
      fileSize: 2 * 10e6 // 2mb in byte
    }
  }))
  @Post("/:id(\\d+)/image")
  uploadImageToGig(@UploadedFile(CompressImagePipe) imageGig: ImageCompressed[], @Param("id", ParseIntPipe) id: number) {
    if (!imageGig || imageGig.length === 0) {
      throw new HttpException("Image must be below 2mb", HttpStatus.FORBIDDEN);
    }
    return this.gigsService.uploadImageToGig(id, imageGig[0])
  }

  @ApiQuery({ name: 'page', required: true, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: true, type: Number, description: 'Number of users per page', example: 10 })
  @Get("")
  getGigs(
    @Query("limit", ParseIntPipe) limit: number,
    @Query("page", ParseIntPipe) page: number) {
    return this.gigsService.getGigs({
      size: limit,
      index: page
    })
  }

  @Get("/:id(\\d+)")
  getGigById(@Param("id", ParseIntPipe) id: number) {
    return this.gigsService.getGigById(id);
  }

  @ApiQuery({ name: 'page', required: true, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: true, type: Number, description: 'Number of gigs per page', example: 10 })
  @ApiQuery({ name: 'keyword', required: true, type: String, description: 'search', example: "gig" })
  @Get("/search")
  searchGigsByName(
    @Query("limit", ParseIntPipe) limit: number,
    @Query("page", ParseIntPipe) page: number,
    @Query("keyword") keyword: string) {
    return this.gigsService.searchGigsByName({ index: page, size: limit }, keyword);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Need permission Owner or admin to access" })
  @UseGuards(JwtGuard, CompositeGuardMixin())
  @CompositeGuardDecorator(OwnerGuard, RoleGuard)
  @Roles(ROLE_LEVEL.ADMIN)
  @ResourceInfo({
    table: "gig_booking",
    field: "renter_id"
  })
  @Delete("/:id(\\d+)")
  deleteGig(@Param("id", ParseIntPipe) id: number) {
    return this.gigsService.removeGig(id);
  }


  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Need permission Owner to access" })
  @UseGuards(JwtGuard, OwnerGuard)
  @ResourceInfo({
    table: "gigs",
    field: "author_id"
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageGig: {
          type: 'string',
          format: 'binary',
          description: 'sub category image file'
        },
      },
    },
  })
  @Post("/:resourceId(\\d+)/upload-image")
  @UseInterceptors(FileInterceptor("imageGig", {
    storage: memoryStorage(),
    limits: {
      fileSize: 2 * 10e6 // 2mb in byte
    }
  }))
  uploadImage(@UploadedFile(CompressImagePipe) imageGig: ImageCompressed[], @Param("resourceId", ParseIntPipe) resourceId: number) {
    if (!imageGig || imageGig.length === 0) {
      throw new BadRequestException("Image is required");
    }
    return this.gigsService.updateImageToGig(imageGig[0], resourceId);
  }

  @ApiBearerAuth("access-token")
  @UseGuards(JwtGuard)
  @Post("/:id(\\d+)/rating")
  ratingGig(@Body() data: RatingDto, @Request() req: RequestWithUser<TokenPayload>, @Param("id", ParseIntPipe) id : number) {
    return this.gigsService.rateGig(req.user.id, id, data.stars)
  }

  @ApiBearerAuth("access-token")
  @UseGuards(JwtGuard)
  @Delete("/:id(\\d+)/rating")
  removeRatingGig(@Request() req: RequestWithUser<TokenPayload>, @Param("id", ParseIntPipe) id : number){
    return this.gigsService.removeRatingGig(req.user.id, id);
  }
}
