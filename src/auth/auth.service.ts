import { HttpException, HttpStatus, Inject, Injectable, NotFoundException, UnauthorizedException, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { registerDto } from './dto/register.dto';
import { TokenPayload } from './dto/token.dto';
import generateRandomString from 'ultil/randomString';
import * as bcrypt from 'bcrypt';
import { ROLE_LEVEL } from 'ultil/types';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        @Inject(forwardRef(() => UsersService))
        private readonly userService: UsersService
    ) { }
    prisma = new PrismaClient();
    //
    async register(data: registerDto) {
        const { email, fullname, password, phone, gender, birthday, skill, certification } = data;
        const user = await this.prisma.users.findFirst({
            where: {
                email: email
            }
        });
        if (user) {
            throw new HttpException("Already register", HttpStatus.CONFLICT);
        }
        const saltOrRounds = 10;
        const hash = await bcrypt.hash(password, saltOrRounds);
        const roleUser = await this.prisma.roles.findFirst({
            where: {
                name_role: ROLE_LEVEL.USER
            }
        })
        const newUser = await this.prisma.users.create({
            data: {
                fullname: fullname,
                email: email,
                pass_word: hash,
                phone: phone,
                gender: gender || null,
                birth_day: birthday || null,
                role_id: roleUser.id
            }
        });
        await this.userService.editSkillsUser(skill, newUser.id);
        await this.userService.addCertifications(certification, newUser.id);
        const payload: TokenPayload = {
            id: newUser.id,
            name: newUser.fullname,
            keyPair: generateRandomString(+process.env.LENGTH_KEY_PAIR)
        }
        const { accessToken, refreshToken } = await this.createPairAccessAndRefreshToken(payload);
        await this.updateRefreshTokenToData(refreshToken, newUser.id);
        return {
            statusCode: HttpStatus.CREATED,
            data: accessToken
        }
    }

    async login(data: LoginDto) {
        const { email, password } = data;
        const user = await this.prisma.users.findFirst({
            where: {
                email: email
            }
        });
        if (!user) {
            throw new HttpException("email or password is not right", HttpStatus.UNAUTHORIZED);
        }
        const { pass_word } = user;
        const isPasswordValid = await bcrypt.compare(password, pass_word);
        if (!isPasswordValid) {
            throw new HttpException("email or password is not right", HttpStatus.UNAUTHORIZED);
        }
        const payload: TokenPayload = {
            id: user.id,
            name: user.fullname,
            keyPair: generateRandomString(+process.env.LENGTH_KEY_PAIR)
        }
        const { accessToken, refreshToken } = await this.createPairAccessAndRefreshToken(payload);
        await this.updateRefreshTokenToData(refreshToken, user.id);
        return {
            statusCode: HttpStatus.OK,
            data: accessToken
        }
    }
    async updateRefreshTokenToData(token: string, userId: number) {
        await this.prisma.users.update({
            where: {
                id: userId,
            },
            data: {
                refresh_token: token
            }
        });
        return true;
    }
    async createPairAccessAndRefreshToken(payload: TokenPayload) {
        const accessToken = await this.createToken(payload,
            {
                secret: process.env.SECRECT_KEY,
                expiresIn: process.env.EXPIRES_IN
            });
        const refreshToken = await this.createToken(payload,
            {
                secret: process.env.SECRECT_KEY_REFRESH,
                expiresIn: process.env.REFRESH_EXPIRES_IN
            });
        return {
            accessToken,
            refreshToken
        };
    }
    async createToken(payload: TokenPayload, { secret, expiresIn }: { secret: string, expiresIn: string }): Promise<string> {
        const token = this.jwtService.sign(payload, {
            secret: secret,
            expiresIn: expiresIn
        });
        return token;
    }

    async verifyRefreshToken(token: string, userId: number): Promise<TokenPayload> {
        try {
            const payload = await this.jwtService.verify(token, {
                secret: process.env.SECRECT_KEY_REFRESH
            });
            return payload;
        }
        catch (err) {
            await this.prisma.users.update({
                where: {
                    id: userId
                },
                data: {
                    refresh_token: null
                }
            });
            // if (err.response === "Token expired") {

            // }
            throw new HttpException("Token refresh expired", HttpStatus.UNAUTHORIZED);
        }
    }
}
