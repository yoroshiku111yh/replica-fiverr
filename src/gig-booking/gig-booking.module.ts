import { Module } from '@nestjs/common';
import { GigBookingService } from './gig-booking.service';
import { GigBookingController } from './gig-booking.controller';

@Module({
  controllers: [GigBookingController],
  providers: [GigBookingService],
})
export class GigBookingModule {}
