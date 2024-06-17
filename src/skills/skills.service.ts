import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class SkillsService {
    prisma = new PrismaClient();
    async getSkills() {
        const skills = await this.prisma.skills.findMany();
        return {
            statusCode: HttpStatus.OK,
            message: "List skills",
            data: skills
        }
    }

    async postSkills(skills: string[]) {
        const db_skills = skills.reduce((ar, value) => {
            if (value.trim().length > 0) {
                ar.push({ name_skill: value });
            }
            return ar;
        }, []);
        await this.prisma.skills.createMany({
            data: db_skills
        });
        return {
            statusCode: HttpStatus.OK,
            message: "Upload list skills success"
        }
    }

    async deleteSkill(skillsId: number[]) {
        /// REMEMBER SETTING ONDELETE IN DATABASE IF YOU DONT WANNA GET A TROUBLE
        await this.prisma.skills.deleteMany({
            where: {
                id: {
                    in: skillsId
                }
            }
        });
        return {
            statusCode : HttpStatus.OK,
            message : "remove skills success"
        };
    }

    async searchByName(skillName: string) {
        const results = await this.prisma.skills.findMany({
            where: {
                name_skill: {
                    contains: skillName
                }
            }
        });
        return {
            statusCode: HttpStatus.OK,
            message: "list skill",
            data: results
        }
    }
}
