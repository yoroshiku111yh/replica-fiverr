import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenExpiredError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard("jwtAuth") {
  handleRequest(err: any, user: any, info: any, context: any, status: any) {
    if (err || !user) {
      if (info instanceof TokenExpiredError) {
        throw new HttpException("Token expired", HttpStatus.UNAUTHORIZED)
      }
      else {
        throw err || new UnauthorizedException();
      }
    }
    return user;
  }
}