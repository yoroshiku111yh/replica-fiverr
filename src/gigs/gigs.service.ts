import { HttpCode, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ImageCompressed } from 'src/pipes/compress-images/compress-images.pipe';
import { UploadGigDto } from './dto/upload-gig.dto';
import { PrismaClient } from '@prisma/client';
import { EditGigDto } from './dto/edit-gig-dto';
import removeDuplicatesInFlatMap from 'ultil/function/getUniqueValueInFlatArray';
import getArrayDifferences from 'ultil/function/getArrayDifferences';
import { GigBookingService } from 'src/gig-booking/gig-booking.service';

@Injectable()
export class GigsService {
    constructor(
        private readonly gigBookingService: GigBookingService
    ) { }
    prisma = new PrismaClient();
    async postGig(image: ImageCompressed, data: UploadGigDto, userId: number) {
        const arCates = removeDuplicatesInFlatMap<number>(JSON.parse(data.cates));
        const arExistCates = await this.checkCatesOfGigExist(arCates);
        if (arExistCates.length === 0) {
            throw new HttpException("Category must have", HttpStatus.BAD_REQUEST);
        }
        const gig = await this.prisma.gigs.create({
            data: {
                name: data.name,
                description: data.description,
                stars: Number(data.stars) || 0,
                detail: data.detail,
                price: Number(data.price),
                image: image && image.path,
                author_id: userId
            }
        });
        const arGigCates = arExistCates.reduce((ar, value) => {
            const obj = { gig_id: gig.id, gig_cate_detail_id: value };
            ar.push(obj);
            return ar;
        }, []);
        await this.prisma.gigs_gig_cate_details.createMany({
            data: arGigCates
        });
        return {
            statusCode: HttpStatus.OK,
            message: "Gig uploaded successfully",
            data: gig
        }
    }

    async editGig(data: EditGigDto, gigId: number) {
        const gig = await this.prisma.gigs.findUnique({
            where: {
                id: gigId
            }
        });
        if (!gig) {
            throw new NotFoundException();
        }

        const arCates = JSON.parse(data.cates);
        await this.editGigCates(gigId, arCates);
        await this.prisma.gigs.update({
            where: {
                id: gigId
            },
            data: {
                name: data.name,
                description: data.description,
                stars: Number(data.stars) || 0,
                detail: data.detail,
                price: Number(data.price),
            }
        })
        return {
            statusCode: HttpStatus.OK,
            message: "Edit gig success",
        }
    }

    async editGigCates(gigId: number, cates: number[]) {
        const arCateExits = removeDuplicatesInFlatMap<number>(cates);
        const arEditCate = await this.checkCatesOfGigExist(arCateExits);
        if (arEditCate.length === 0) {
            throw new HttpException("Category must have", HttpStatus.BAD_REQUEST);
        }
        const listCateOfGig = await this.prisma.gigs_gig_cate_details.findMany({
            where: {
                gig_id: gigId,
            }
        });
        const arCateCurrent = listCateOfGig.reduce((ar, value) => {
            ar.push(value.gig_cate_detail_id);
            return ar;
        }, []);
        const { removedItems: removeCate, newItems: newCate } = getArrayDifferences(arCateCurrent, arEditCate);
        await Promise.allSettled(removeCate.map(cate => this.removeCateOfGig(gigId, cate)));
        await Promise.allSettled(newCate.map(cate => this.prisma.gigs_gig_cate_details.create({
            data: {
                gig_id: gigId,
                gig_cate_detail_id: cate
            }
        })));
        return {
            statusCode: HttpStatus.OK,
            message: "Edit gig cate success"
        }
    }

    async removeCateOfGig(gigId: number, cateId: number) {
        await this.prisma.gigs_gig_cate_details.delete({
            where: {
                gig_id_gig_cate_detail_id: {
                    gig_id: gigId,
                    gig_cate_detail_id: cateId
                }
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "Remove cate of gig success"
        }
    }

    async checkCatesOfGigExist(cates: number[]) {
        const checkCates = await Promise.all(cates.map(value => this.prisma.gig_cate_details.findUnique({ where: { id: value }, select: { id: true } })));
        const arExistCates = checkCates.reduce((ar, value) => {
            if (value) {
                ar.push(value.id);
            }
            return ar;
        }, []);
        return arExistCates;
    }

    async uploadImageToGig(gigId: number, image: ImageCompressed) {
        const gig = await this.prisma.gigs.findUnique({
            where: {
                id: gigId,
                deleted: false || null
            }
        });
        if (!gig) {
            throw new NotFoundException();
        }
        await this.prisma.gigs.update({
            where: {
                id: gigId
            },
            data: {
                image: image.path
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "Upload image success",
            data: image.path
        }
    }

    async getGigs(page: { index: number, size: number }) {
        const total = await this.prisma.gigs.count({
            where: {
                deleted: false
            }
        });
        const index = (page.index - 1) * page.size;
        const gigs = await this.prisma.gigs.findMany({
            skip: index,
            take: page.size,
            orderBy: {
                id: 'desc'
            },
            where: {
                deleted: false,
            },
            include: {
                users: {
                    select: {
                        fullname: true,
                        id: true,
                        avatar: true,
                    }
                },
                gigs_gig_cate_details: {
                    include: {
                        gig_cate_details: {
                            select: {
                                name: true,
                                id: true
                            }
                        }
                    }
                }
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "List gigs",
            data: {
                currentPage: page.index,
                pageSize: page.size,
                totalPage: Math.ceil(total / page.size),
                data: gigs
            }
        }
    }

    async getGigById(id: number) {
        const gig = await this.prisma.gigs.findUnique({
            where: {
                deleted: false,
                id: id
            },
            include: {
                users: {
                    select: {
                        fullname: true,
                        id: true,
                        avatar: true,
                    }
                },
                gigs_gig_cate_details: {
                    include: {
                        gig_cate_details: {
                            select: {
                                name: true,
                                id: true
                            }
                        }
                    }
                }
            }
        });
        if (!gig) {
            throw new NotFoundException();
        }
        else {
            return {
                statusCode: HttpStatus.OK,
                message: "Gig detail",
                data: gig
            }
        }
    }

    async searchGigsByName(page: { index: number, size: number }, keyword: string) {
        const total = await this.prisma.gigs.count({
            where: {
                deleted: false,
                name: {
                    contains: keyword,
                }
            }
        });
        const index = (page.index - 1) * page.size;
        const gigs = await this.prisma.gigs.findMany({
            where: {
                deleted: false,
                name: {
                    contains: keyword,
                }
            },
            skip: index,
            take: page.size,
            orderBy: {
                id: 'desc'
            },
            include: {
                users: {
                    select: {
                        fullname: true,
                        id: true,
                        avatar: true,
                    }
                },
                gigs_gig_cate_details: {
                    include: {
                        gig_cate_details: {
                            select: {
                                name: true,
                                id: true
                            }
                        }
                    }
                }
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "List gigs search :",
            data: {
                currentPage: page.index,
                pageSize: page.size,
                totalPage: Math.ceil(total / page.size),
                data: gigs
            }
        }
    }

    async updateImageToGig(image: ImageCompressed, id: number) {
        const gig = await this.prisma.gigs.findUnique({
            where: {
                deleted: false,
                id: id
            }
        });
        if (!gig) {
            throw new HttpException("Gig not found", HttpStatus.NOT_FOUND);
        }
        await this.prisma.gigs.update({
            where: {
                deleted: false,
                id: id
            },
            data: {
                image: image.path
            }
        })
        return {
            statusCode: HttpStatus.OK,
            message: "upload image success",
            data: image
        }
    }

    async removeGig(gigId: number) {
        const gig = await this.prisma.gigs.findUnique({
            where: {
                id: gigId
            }
        });
        if (!gig) {
            throw new NotFoundException("gig not found");
        }
        await this.prisma.gigs.update({
            where: {
                id: gigId
            },
            data: {
                deleted: true
            }
        });
        const listBooking = await this.prisma.gig_booking.findMany({
            where: {
                gig_id: gigId
            }
        });
        await Promise.allSettled(listBooking.map((booking) => {
            return this.gigBookingService.deleteBooking(booking.id);
        }));
        return {
            statusCode: HttpStatus.OK,
            message: "remove gig success"
        }
    }

    async rateGig(userId: number, gigId: number, rating: number) {
        let createNew = 0;
        let prevRating = 0;
        const gig = await this.prisma.gigs.findUnique({
            where: {
                id: gigId
            }
        });
        if (!gig) {
            throw new NotFoundException("gig not found");
        }
        const ratingByUser = await this.prisma.gig_rating_users.findUnique({
            where: {
                gig_id_user_id: {
                    gig_id: gigId,
                    user_id: userId
                }
            },
        });
        if (!ratingByUser) {
            createNew = 1;
        }
        else {
            prevRating = ratingByUser.rating;
        }
        await this.prisma.gig_rating_users.upsert({
            where: {
                gig_id_user_id: {
                    gig_id: gigId,
                    user_id: userId
                }
            },
            update: {
                rating: rating
            },
            create: {
                gig_id: gigId,
                user_id: userId,
                rating: rating
            }
        });
        await this.prisma.gigs.update({
            where: {
                id: gigId
            },
            data: {
                rating_count: gig.rating_count + createNew,
                rating_total: gig.rating_total - prevRating + rating
            }
        })
        return {
            statusCode: HttpStatus.OK,
            message: "rating gig success"
        }
    }
    async removeRatingGig(userId: number, gigId: number) {
        const gig = await this.prisma.gigs.findUnique({
            where: {
                id: gigId
            }
        });
        const gigRating = await this.prisma.gig_rating_users.findUnique({
            where: {
                gig_id_user_id: {
                    gig_id: gigId,
                    user_id: userId
                }
            }
        });
        if (!gig) {
            throw new NotFoundException("gig not found");
        }
        const prevRating = gigRating.rating;
        await this.prisma.gig_rating_users.delete({
            where: {
                gig_id_user_id: {
                    gig_id: gigId,
                    user_id: userId
                }
            }
        });
        await this.prisma.gigs.update({
            where: {
                id: gigId
            },
            data: {
                rating_count: gig.rating_count - 1,
                rating_total: gig.rating_total - prevRating
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "Remove rating success"
        }
    }
}
