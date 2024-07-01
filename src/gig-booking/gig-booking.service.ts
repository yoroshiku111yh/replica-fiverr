import { STATUS_BOOKING } from './../../ultil/types';
import { Injectable, NotFoundException, ExecutionContext, HttpException, HttpStatus, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PostBooking } from './dto/post-booking.dto';
import { PrismaClient } from '@prisma/client';
import isValidDate from 'ultil/function/validDateString';
import { UpdateBooking } from './dto/update-booking.dto';

@Injectable()
export class GigBookingService {
    prisma = new PrismaClient();
    async createBooking(data: PostBooking, userId: number) {
        if (!isValidDate(data.endAt)) {
            throw new BadRequestException("invalid date string");
        }
        const gig = await this.prisma.gigs.findUnique({
            where: {
                deleted: false,
                id: data.gig_id
            },
            include: {
                users: {
                    select: {
                        id: true,
                    }
                },
            }
        });
        if (!gig) {
            throw new NotFoundException("Gig not found");
        }
        if (userId === gig.author_id) {
            throw new HttpException("You cannot hire yourself", HttpStatus.UNAUTHORIZED);
        }
        const statusCreated = await this.prisma.gig_status.findFirst({
            where: {
                name: STATUS_BOOKING.CREATED
            }
        });
        if (!statusCreated) {
            throw new HttpException("Missing database", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        const booking = await this.prisma.gig_booking.create({
            data: {
                gig_id: data.gig_id,
                renter_id: userId,
                status_id: statusCreated.id,
                gig_author_id: gig.users.id,
                endAt: new Date(data.endAt),
                name_booking : data.name_booking
            }
        });
        await this.prisma.gig_booking_user.upsert({
            where: {
                renter_id_author_id: {
                    author_id: gig.author_id,
                    renter_id: userId
                }
            },
            update: {},
            create: {
                author_id: gig.author_id,
                renter_id: userId
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "booking success",
            data: booking
        }
    }

    async getAllBooking(page: { index: number, size: number }) {
        const total = await this.prisma.gig_booking.count({
            where: {
                deleted: false
            }
        })
        const index = (page.index - 1) * page.size;
        const booking = await this.prisma.gig_booking.findMany({
            where: {
                deleted: false
            },
            take: page.size,
            skip: index,
            orderBy: {
                id: 'desc'
            },
            include: {
                users_gig_booking_gig_author_idTousers: {
                    select: {
                        id: true,
                        fullname: true,
                        email: true,
                        avatar: true
                    }
                },
                users_gig_booking_renter_idTousers: {
                    select: {
                        id: true,
                        fullname: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "List booking",
            data: {
                currentPage: page.index,
                pageSize: page.size,
                totalPage: Math.ceil(total / page.size),
                data: booking
            }
        }
    }
    async getAllBookingByAuthorId(page: { index: number, size: number }, authorId: number) {
        const total = await this.prisma.gig_booking.count({
            where: {
                deleted: false,
                gig_author_id: authorId
            }
        })
        const index = (page.index - 1) * page.size;
        const booking = await this.prisma.gig_booking.findMany({
            where: {
                deleted: false,
                gig_author_id: authorId
            },
            take: page.size,
            skip: index,
            orderBy: {
                id: 'desc'
            },
            include: {
                users_gig_booking_gig_author_idTousers: {
                    select: {
                        id: true,
                        fullname: true,
                        email: true,
                        avatar: true
                    }
                },
                users_gig_booking_renter_idTousers: {
                    select: {
                        id: true,
                        fullname: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "List booking",
            data: {
                currentPage: page.index,
                pageSize: page.size,
                totalPage: Math.ceil(total / page.size),
                data: booking
            }
        }
    }
    async getAllBookingByRenterId(page: { index: number, size: number }, renterId: number) {
        const total = await this.prisma.gig_booking.count({
            where: {
                deleted: false,
                renter_id: renterId
            }
        })
        const index = (page.index - 1) * page.size;
        const booking = await this.prisma.gig_booking.findMany({
            where: {
                deleted: false,
                renter_id: renterId
            },
            take: page.size,
            skip: index,
            orderBy: {
                id: 'desc'
            },
            include: {
                users_gig_booking_gig_author_idTousers: {
                    select: {
                        id: true,
                        fullname: true,
                        email: true,
                        avatar: true
                    }
                },
                users_gig_booking_renter_idTousers: {
                    select: {
                        id: true,
                        fullname: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "List booking",
            data: {
                currentPage: page.index,
                pageSize: page.size,
                totalPage: Math.ceil(total / page.size),
                data: booking
            }
        }
    }
    async getListUsersBooked(page: { index: number, size: number }, userId: number) {
        const total = await this.prisma.gig_booking_user.count({
            where: {
                renter_id: userId
            }
        });
        const index = (page.index - 1) * page.size;
        const listUser = await this.prisma.gig_booking_user.findMany({
            where: {
                renter_id: userId
            },
            skip: index,
            take: page.size,
            include: {
                users_gig_booking_user_author_idTousers: {
                    select: {
                        id: true,
                        fullname: true,
                        avatar: true,
                        email: true
                    },
                }
            }
        });
        const sortedUsers = listUser.sort((a, b) => {
            const nameA = a.users_gig_booking_user_author_idTousers.fullname.toUpperCase();
            const nameB = b.users_gig_booking_user_author_idTousers.fullname.toUpperCase();
            if (nameA < nameB) {
                return 1;
            }
            if (nameA > nameB) {
                return -1;
            }
            return 0;
        })
        return {
            statusCode: HttpStatus.OK,
            message: "List users",
            data: {
                currentPage: page.index,
                pageSize: page.size,
                totalPage: Math.ceil(total / page.size),
                data: sortedUsers
            }
        }
    }

    async updateBookingById(data: UpdateBooking, bookingId: number) {
        const booking = await this.prisma.gig_booking.findUnique({
            where: {
                id: bookingId,
                deleted: false
            }
        });
        if (!booking) {
            throw new NotFoundException("booking not found");
        }
        const status = await this.prisma.gig_status.findUnique({
            where: {
                id: data.status_id
            }
        });
        if (!status) {
            throw new NotFoundException("Status gig not found");
        }
        await this.prisma.gig_booking.update({
            where: {
                id: bookingId,
                deleted: false
            },
            data: {
                endAt: new Date(data.endAt),
                status_id: data.status_id,
                name_booking : data.name_booking
            }
        })
        return {
            statusCode: HttpStatus.OK,
            message: "update success"
        }
    }
    async getAllStatusBooking() {
        const status = await this.prisma.gig_status.findMany();
        return {
            statusCode: HttpStatus.OK,
            message: "list status",
            data: status
        }
    }
    async deleteBooking(bookingId: number) {
        const booking = await this.prisma.gig_booking.findUnique({
            where: {
                deleted: false,
                id: bookingId
            }
        });
        if (!booking) {
            throw new NotFoundException("booking not found");
        }
        const status = await this.prisma.gig_status.findUnique({
            where :{
                id : 1
            }
        })
        await this.prisma.gig_booking.update({
            where: {
                deleted: false,
                id: bookingId
            },
            data: {
                deleted: true,
                status_id : status.id
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "remove success"
        }
    }
    async searchBooking(query: { index: number, size: number ,keyword : string, authorId ?: number}, userId : number) {
        const total = await this.prisma.gig_booking.count({
            where : {
                deleted : false,
                renter_id : userId,
                gig_author_id : query.authorId,
                name_booking : {
                    contains : query.keyword
                }
            }
        });
        const index = (query.index - 1) * query.size;
        const listSearch = await this.prisma.gig_booking.findMany({
            where : {
                deleted : false,
                renter_id : userId,
                gig_author_id : query.authorId,
                name_booking : {
                    contains : query.keyword
                }
            },
            take : query.size,
            skip : index
        });
        return {
            statusCode: HttpStatus.OK,
            message: "List booking search :",
            data: {
                currentPage: query.index,
                pageSize: query.size,
                totalPage: Math.ceil(total / query.size),
                data: listSearch
            }
        }
    }
}
