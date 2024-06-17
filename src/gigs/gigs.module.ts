import { Module } from '@nestjs/common';
import { GigsService } from './gigs.service';
import { GigsController } from './gigs.controller';

@Module({
  controllers: [GigsController],
  providers: [GigsService,
    {
      provide: 'UPLOAD_PATH',
      useValue: process.env.PATH_PUBLIC_IMAGE_UPLOAD
    }
  ],
})
export class GigsModule {}
