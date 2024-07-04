import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { NotFoundError } from 'rxjs';
import { PostCommentDto } from './dto/post-comment.dto';

@Injectable()
export class CommentService {
    prisma = new PrismaClient();

    async postComment(gigId : number, data : PostCommentDto, userId : number){
        const gig = await this.prisma.gigs.findUnique({
            where: {
                id: gigId
            }
        });
        if (!gig) {
            throw new NotFoundException("Gig not found");
        }
        const comment = await this.prisma.gig_comments.create({
            data : {
                user_id : userId,
                content : data.comment
            }
        });
        await this.prisma.gig_comments_users.create({
            data : {
                gig_id : gig.id,
                comment_id : comment.id,
                user_id : comment.user_id
            }
        });
        return {
            statusCode : HttpStatus.OK,
            message : "post comment success"
        }
    }

    async hiddenComment(commentId : number){
        const comment = await this.prisma.gig_comments.findUnique({
            where : {
                id : commentId
            }
        });
        if(!comment){
            throw new NotFoundException("Comment not found");
        }
        await this.prisma.gig_comments.update({
            where : {
                id : commentId
            },
            data : {
                deleted : true
            }
        });
        return {
            statusCode : HttpStatus.OK,
            message : "Hidden comment success"
        }
    }

    async getCommentByGigId(page: { index: number, size: number }, gigId: number) {
        const gig = await this.prisma.gigs.findUnique({
            where: {
                id: gigId,
                deleted : false,
                users : {
                    deleted : false
                }
            }
        });
        if (!gig) {
            throw new NotFoundException("Gig not found");
        }
        const total = await this.prisma.gig_comments.count({
            where: {
                gig_comments_users: {
                    some: {
                        gig_id: gig.id
                    }
                },
                deleted: false,
                users : {
                    deleted : false
                }
            }
        });
        const index = (page.index - 1) * page.size;
        const listComment = await this.prisma.gig_comments.findMany({
            where: {
                gig_comments_users: {
                    some: {
                        gig_id: gig.id
                    }
                },
                deleted: false,
                users : {
                    deleted : false
                }
            },
            include: {
                users: {
                    select: {
                        id: true,
                        fullname: true,
                        email: true,
                        avatar: true
                    }
                }
            },
            skip: index,
            take: page.size,
            orderBy: {
                id: 'desc'
            },
        });
        return {
            statusCode: HttpStatus.OK,
            message: "List comment",
            data: {
                currentPage: page.index,
                pageSize: page.size,
                totalPage: Math.ceil(total / page.size),
                data: listComment
            }
        }
    }
}
