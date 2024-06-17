import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports : [
    JwtModule.register({}),
    forwardRef(() => UsersModule),
  ],
  exports : [AuthService]
})
export class AuthModule {}
