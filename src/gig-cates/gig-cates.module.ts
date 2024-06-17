import { Module } from '@nestjs/common';
import { GigCatesService } from './gig-cates.service';
import { GigCatesController } from './gig-cates.controller';

@Module({
  controllers: [GigCatesController],
  providers: [GigCatesService, {
    provide: 'UPLOAD_PATH',
    useValue: process.env.PATH_IMAGE_PUBLIC_CATEGORIES
  }],
})
export class GigCatesModule { }
