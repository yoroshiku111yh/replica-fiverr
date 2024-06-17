import { HttpCode, HttpStatus, Injectable } from '@nestjs/common';
import { ImageCompressed } from 'src/pipes/compress-images/compress-images.pipe';
import { UploadGigDto } from './dto/upload-gig.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class GigsService {
    prisma = new PrismaClient();
    async postGig(image : ImageCompressed, data : UploadGigDto, userId : number){
        const gig = await this.prisma.gigs.create({
            data : {
                name : data.name,
                description : data.description,
                stars : Number(data.stars) || 0,
                detail : data.detail,
                price : Number(data.price),
                image : image.path,
                author_id : userId
            }
        });
        return {
            statusCode : HttpStatus.OK,
            message : "Gig uploaded successfully",
            data : gig
        }
    }
}
