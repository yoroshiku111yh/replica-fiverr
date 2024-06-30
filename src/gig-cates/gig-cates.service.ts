import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SubGigCateDto } from './dto/sub-cate.dto';
import { removeExcludedKeys } from 'ultil/function/excludeField';
import { ImageCompressed } from 'src/pipes/compress-images/compress-images.pipe';

@Injectable()
export class GigCatesService {
    prisma = new PrismaClient();
    async postCategories(cates: string[]) {
        const data = cates.reduce((ar, value) => {
            ar.push({
                name_cate: value
            });
            return ar;
        }, []);
        const results = await this.prisma.gig_cates.createMany({
            data: data
        })
        return {
            statusCode: HttpStatus.OK,
            message: "Upload categories of gig success",
            data: results
        }
    }

    async getCategories() {
        const results = await this.prisma.gig_cates.findMany({});
        return {
            statusCode: HttpStatus.OK,
            message: "List Categories",
            data: results
        }
    }
    async getAllSubCateByIdCate(cateId: number) {
        const results = await this.prisma.gig_cate_details.findMany({
            where: {
                gig_cate_id: cateId
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "List sub categories",
            data: results
        }
    }

    async postSubCategory(data: SubGigCateDto, cateId: number) {
        const result = await this.prisma.gig_cate_details.create({
            data: {
                name: data.name,
                description: data.description,
                gig_cate_id: cateId
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "Upload sub category success",
            data: result
        }
    }

    async postSubCategoryImage(cateId: number, image: ImageCompressed) {
        await this.prisma.gig_cate_details.update({
            where: {
                id: cateId
            },
            data: {
                image: image.path
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "Upload sub category image success",
            data: image.path
        }
    }

    async searchSubCateByName(search: string) {
        const results = await this.prisma.gig_cate_details.findMany({
            where: {
                name: {
                    contains: search
                }
            },
            include: {
                gig_cates: {
                    select: {
                        name_cate: true
                    }
                }
            }
        });
        const convertAr = results.reduce((ar, value) => {
            const obj = { root_cate: value.gig_cates.name_cate };
            const newObj = removeExcludedKeys({ ...value, ...obj }, ["gig_cate_id", "gig_cates"]);
            ar.push(newObj);
            return ar;
        }, [])
        return {
            statusCode: HttpStatus.OK,
            message: "List search sub categories",
            data: convertAr
        }
    }

    async searchRootCateByName(search: string) {
        const results = await this.prisma.gig_cates.findMany({
            where: {
                name_cate: {
                    contains: search
                }
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "List search root categories",
            data: results
        }
    }

    async deleteRootCate(cateId: number) {
        ////WHEN DELETE WILL SET NULL FOR SUB CATEGORIES
        await this.prisma.gig_cates.delete({
            where: {
                id: cateId
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "Delete root cateory success"
        }
    }

    async deleteSubCate(cateId: number) {
        await this.prisma.gig_cate_details.delete({
            where: {
                id: cateId
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "Delete sub cateory success"
        }
    }

    async getGigsBySubCateId(cateId: number, page: { index: number, size: number }) {
        const total = await this.prisma.gigs.count({
            where: {
                gigs_gig_cate_details: {
                    some: {
                        gig_cate_detail_id: cateId
                    }
                }
            }
        });
        const index = (page.index - 1) * page.size;
        const result = await this.prisma.gigs.findMany({
            where: {
                gigs_gig_cate_details: {
                    some: {
                        gig_cate_detail_id: cateId
                    }
                }
            },
            skip: index,
            take: page.size,
            orderBy: {
                id: 'desc'
            },
            include: {
                gigs_gig_cate_details: {
                    include: {
                        gig_cate_details: true
                    }
                }
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "list gigs of sub category",
            data: {
                currentPage: page.index,
                pageSize: page.size,
                totalPage: Math.ceil(total / page.size),
                data: result
            }
        };
    }
}
