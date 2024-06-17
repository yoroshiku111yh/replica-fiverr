import { Body, Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { GigsService } from './gigs.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { UploadGigDto } from './dto/upload-gig.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CompressImagePipe, ImageCompressed } from 'src/pipes/compress-images/compress-images.pipe';
import { RequestWithUser } from 'ultil/types';
import { TokenPayload } from 'src/auth/dto/token.dto';

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
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Gig name' },
        description: { type: 'string', example: 'Gig description' },
        stars: { type: 'number', example: '0', minimum : 0 },
        detail: { type: 'string', example: 'Gig detail' },
        price: { type: 'number', example: '100' },
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
}
