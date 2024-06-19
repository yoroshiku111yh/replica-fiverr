import { Body, Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { GigsService } from './gigs.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { UploadGigDto } from './dto/upload-gig.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CompressImagePipe, ImageCompressed } from 'src/pipes/compress-images/compress-images.pipe';
import { RequestWithUser } from 'ultil/types';
import { TokenPayload } from 'src/auth/dto/token.dto';
import { OwnerGuard } from 'src/guards/owner/owner.guard';
import { ResourceInfo } from 'src/decorators/resource-info/resource-info.decorator';
import { EditGigDto } from './dto/edit-gig-dto';

@ApiTags("Gigs")
@Controller('gigs')
export class GigsController {
  constructor(private readonly gigsService: GigsService) { }

  @ApiBearerAuth("access-token")
  @UseGuards(JwtGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload Gig',
    required: true,
    type : UploadGigDto,
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
  @UseGuards(JwtGuard, OwnerGuard)
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


}
