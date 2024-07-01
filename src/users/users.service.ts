import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ImageCompressed } from 'src/pipes/compress-images/compress-images.pipe';
import { removeExcludedKeys } from 'ultil/function/excludeField';
import { UserInfoDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { TokenPayload } from 'src/auth/dto/token.dto';
import generateRandomString from 'ultil/function/randomString';
import { AuthService } from 'src/auth/auth.service';
import getArrayDifferences from 'ultil/function/getArrayDifferences';

@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) { }
  prisma = new PrismaClient();
  async getProfile(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: {
        id: userId
      },
      include: {
        roles: true
      }
    });
    const obj = { ...user, ...{ role: user.roles.name_role } };

    const objAfterExcludeFields = removeExcludedKeys<UserInfoDto>(obj, ["roles", "pass_word", "refresh_token", "role_id", "deleted"]);
    if (!user) {
      throw new NotFoundException();
    }
    return {
      statusCode: HttpStatus.OK,
      data: objAfterExcludeFields
    }
  }
  async uploadAvatar(avatar: ImageCompressed, userId: number) {
    await this.prisma.users.update({
      where: {
        id: userId
      },
      data: {
        avatar: avatar.path
      }
    });
    return {
      statusCode: HttpStatus.OK,
      message: "upload avatar success",
      data: avatar.path
    }
  }

  async editProfile(data: UpdateUserDto, userId: number) {
    const { gender, birthday, fullname, phone, skill } = data;
    const user = await this.prisma.users.findUnique({
      where : {
        id : userId,
      },
      include : {
        roles : true
      }
    });
    if (!user) {
      throw new NotFoundException("user not found");
    }
    await this.prisma.users.update({
      where: {
        id: userId
      },
      data: {
        gender: gender,
        fullname: fullname,
        birth_day: birthday,
        phone: phone
      }
    });
    await this.editSkillsUser(skill, userId);
    const payload: TokenPayload = {
      id: userId,
      name: fullname,
      keyPair: generateRandomString(+process.env.LENGTH_KEY_PAIR),
      role : user.roles.name_role
    }
    const { accessToken, refreshToken } = await this.authService.createPairAccessAndRefreshToken(payload);
    await this.authService.updateRefreshTokenToData(refreshToken, userId);
    return {
      statusCode: HttpStatus.OK,
      message: "Update success",
      data: accessToken
    }
  }

  async editSkillsUser(skills: string[], userId: number) {
    const listSkill = await this.prisma.skill_user.findMany({
      where: {
        user_id: userId
      },
      include: {
        skills: true
      }
    });
    const nameSkills = listSkill.reduce((acc, obj) => {
      if (obj.skills && obj.skills.name_skill) {
        acc.push(obj.skills.name_skill);
      }
      return acc;
    }, []);
    const { removedItems: missSkill, newItems: newSkill } = getArrayDifferences(nameSkills, skills);

    await Promise.allSettled(missSkill.map(skill => this.removeSkillUser(skill, userId)));
    await Promise.allSettled(newSkill.map(skill => this.addSkillUser(skill, userId)));
    return {
      statusCode: HttpStatus.OK,
      message: "Upload skills success"
    }
  }
  async removeSkillUser(skill: string, userId: number) {
    const skillId = await this.prisma.skills.findFirst({
      where: {
        name_skill: skill
      },
      select: {
        id: true
      }
    });
    if (!skillId) {
      throw new NotFoundException();
    }
    await this.prisma.skill_user.delete({
      where: {
        skill_id_user_id: {
          skill_id: skillId.id,
          user_id: userId
        }
      }
    });
    return true;
  }
  async addSkillUser(skill: string, userId: number) {
    const skillId = await this.prisma.skills.findFirst({
      where: {
        name_skill: skill
      },
      select: {
        id: true
      }
    });
    if (!skillId) {
      throw new NotFoundException();
    }
    await this.prisma.skill_user.upsert({
      where: {
        skill_id_user_id: {
          skill_id: skillId.id,
          user_id: userId
        }
      },
      create: {
        skill_id: skillId.id,
        user_id: userId
      },
      update: {}
    });
    return true;
  }

  async addCertifications(nameCerti: string[], userId: number) {
    const ar = nameCerti.reduce((initAr, certi) => {
      if (certi) {
        initAr.push({ name: certi, user_id: userId });
      }
      return initAr;
    }, []);
    const results = await this.prisma.certification.createMany({
      data: ar
    });
    return results;
  }

  async getCertifications(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: {
        id: userId
      }
    });
    if (!user) {
      throw new NotFoundException();
    }
    const listCerti = await this.prisma.certification.findMany({
      where: {
        user_id: userId
      }
    });
    return {
      statusCode: HttpStatus.OK,
      message: "List certifications",
      data: listCerti
    }
  }

  async deleteCertification(certiId: number) {
    await this.prisma.certification.delete({
      where: {
        id: certiId
      }
    });
    return {
      statusCode: HttpStatus.OK,
      message: "Deleted certification success"
    }
  }

  async postCertifications(certifications: string[], userId: number) {
    const arObj = certifications.reduce((ar, value) => {
      const _obj = { name: value, user_id: userId };
      ar.push(_obj);
      return ar;
    }, []);
    await this.prisma.certification.createMany({
      data: arObj
    })
    return {
      statusCode: HttpStatus.OK,
      message: "Upload success certifications"
    }
  }

  async searchByName(keyword: string, page: { size: number, index: number }) {
    const total = await this.prisma.users.count({
      where: {
        deleted: false,
        fullname: {
          contains: keyword,
        }
      }
    });
    const index = (page.index - 1) * page.size;
    const users = await this.prisma.users.findMany({
      where: {
        deleted: false,
        fullname: {
          contains: keyword,
        }
      },
      include: {
        roles: true
      },
      take: page.size,
      skip: index,
      orderBy: {
        id: 'desc'
      }
    });
    const usersAfterExcludeFields = users.map(user => {
      const obj = { ...user, ...{ role: user.roles.name_role } };
      return removeExcludedKeys<UserInfoDto>(obj, ["pass_word", "refresh_token", "deleted", "role_id", "roles"])
    });
    return {
      statusCode: HttpStatus.OK,
      message: "List search user fullname",
      data: {
        currentPage: page.index,
        pageSize: page.size,
        totalPage: Math.ceil(total / page.size),
        data: usersAfterExcludeFields
      }
    }
  }

  async getSkills(userId: number) {
    const listSkill = await this.prisma.skills.findMany({
      where: {
        skill_user: {
          some: {
            user_id: userId
          }
        }
      }
    });
    return {
      statusCode: HttpStatus.OK,
      message: "List skill of user",
      data: listSkill
    }
  }

  async getGigsByUserId(userId: number, page: { size: number, index: number }) {
    const total = await this.prisma.gigs.count({
      where: {
        author_id: userId
      }
    });
    const index = (page.index - 1) * page.size;
    const listGig = await this.prisma.gigs.findMany({
      where: {
        author_id: userId
      },
      take: page.size,
      skip: index,
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
      message: "list gigs of user",
      data: {
        currentPage: page.index,
        pageSize: page.size,
        totalPage: Math.ceil(total / page.size),
        data: listGig
      }
    }
  }
}
