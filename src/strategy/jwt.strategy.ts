import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { PrismaClient } from "@prisma/client";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwtAuth") {
    constructor(
        readonly authService: AuthService) {
        super(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                ignoreExpiration: false,
                secretOrKey: process.env.SECRECT_KEY,
            }
        )
    }
    prisma = new PrismaClient();
    async validate(payload: any) {
        if(!payload) throw new UnauthorizedException();
        
        const user = await this.prisma.users.findUnique({
            where: {
                id : payload.id
            }
        })
        if(!user){
            throw new UnauthorizedException();
        }
        const payloadRefresh = await this.authService.verifyRefreshToken(user.refresh_token, user.id);
        if(payloadRefresh.keyPair !== payload.keyPair){
            throw new UnauthorizedException();
        }
        return payload;
    }
}