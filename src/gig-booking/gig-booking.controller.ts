import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { GigBookingService } from './gig-booking.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { RequestWithUser } from 'ultil/types';
import { TokenPayload } from 'src/auth/dto/token.dto';
import { PostBooking } from './dto/post-booking';
import { UpdateBooking } from './dto/update-booking';
import { OwnerGuard } from 'src/guards/owner/owner.guard';
import { ResourceInfo } from 'src/decorators/resource-info/resource-info.decorator';

@Controller('gig-booking')
@ApiTags("Booking")
export class GigBookingController {
  constructor(private readonly gigBookingService: GigBookingService) { }

  @ApiQuery({ name: 'page', required: true, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: true, type: Number, description: 'Number of booking per page', example: 10 })
  @Get("")
  getAllBooking(@Query("limit", ParseIntPipe) limit: number,
    @Query("page", ParseIntPipe) page: number) {
    return this.gigBookingService.getAllBooking({ index: page, size: limit });
  }

  @ApiQuery({ name: 'page', required: true, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: true, type: Number, description: 'Number of booking per page', example: 10 })
  @Get("/author/:id(\\d+)")
  getBookingByAuthorId(@Query("limit", ParseIntPipe) limit: number,
    @Query("page", ParseIntPipe) page: number, @Param("id", ParseIntPipe) id: number) {
    return this.gigBookingService.getAllBookingByAuthorId({ index: page, size: limit }, id);
  }

  @ApiQuery({ name: 'page', required: true, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: true, type: Number, description: 'Number of booking per page', example: 10 })
  @Get("/renter/:id(\\d+)")
  getBookingByRenterId(@Query("limit", ParseIntPipe) limit: number,
    @Query("page", ParseIntPipe) page: number, @Param("id", ParseIntPipe) id: number) {
    return this.gigBookingService.getAllBookingByRenterId({ index: page, size: limit }, id);
  }

  @ApiBearerAuth("access-token")
  @UseGuards(JwtGuard)
  @Post("")
  createBooking(@Body() data: PostBooking, @Request() request: RequestWithUser<TokenPayload>) {
    return this.gigBookingService.createBooking(data, request.user.id);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Need permission Owner to access" })
  @UseGuards(JwtGuard, OwnerGuard)
  @ResourceInfo({
    table: "gig_booking",
    field: "renter_id"
  })
  @Put("/:resourceId(\\d+)")
  updateBookingById(@Body() data: UpdateBooking, @Param("resourceId", ParseIntPipe) resourceId: number) {
    return this.gigBookingService.updateBookingById(data, resourceId);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Need permission Owner to access" })
  @UseGuards(JwtGuard, OwnerGuard)
  @ResourceInfo({
    table: "gig_booking",
    field: "renter_id"
  })
  @Delete("/:resourceId(\\d+)")
  deleteBookingById(@Param("resourceId", ParseIntPipe) resourceId: number) {
    return this.gigBookingService.deleteBooking(resourceId);
  }


  @Get("/search")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtGuard)
  @ApiQuery({ name: 'page', required: true, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: true, type: Number, description: 'Number of booking per page', example: 10 })
  @ApiQuery({ name: 'author_id', required: false, type: Number, description: "Filter by author id's gig" })
  @ApiQuery({ name: 'keyword', required: true, type: String, description: 'keyword searching' })
  searchBooking(
    @Query("limit", ParseIntPipe) limit: number,
    @Query("page", ParseIntPipe) page: number,
    @Query("author_id") author_id: number,
    @Query("keyword") keyword: string,
    @Request() req: RequestWithUser<TokenPayload>
  ) {
    return this.gigBookingService.searchBooking({
      size: limit,
      index: page,
      authorId: Number(author_id) || undefined,
      keyword: keyword
    }, req.user.id);
  }

  @Get("/history/user")
  @ApiBearerAuth("access-token")
  @UseGuards(JwtGuard)
  @ApiQuery({ name: 'page', required: true, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: true, type: Number, description: 'Number of booking per page', example: 10 })
  getListUsersBooked(@Query("limit", ParseIntPipe) limit: number,
    @Query("page", ParseIntPipe) page: number, @Request() req: RequestWithUser<TokenPayload>) {
    return this.gigBookingService.getListUsersBooked({ size: limit, index: page }, req.user.id);
  }

  @Get("/status")
  getAllStatusBooking() {
    return this.gigBookingService.getAllStatusBooking();
  }
}
