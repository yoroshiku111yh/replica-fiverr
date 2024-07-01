import { Module } from '@nestjs/common';
import { GigsService } from './gigs.service';
import { GigsController } from './gigs.controller';
import { GigBookingModule } from 'src/gig-booking/gig-booking.module';

@Module({
  controllers: [GigsController],
  imports : [GigBookingModule],
  providers: [GigsService,
    {
      provide: 'UPLOAD_PATH',
      useValue: process.env.PATH_PUBLIC_IMAGE_UPLOAD
    }
  ],
})
export class GigsModule {}
