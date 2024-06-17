import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [UsersController],
  imports: [
    JwtModule.register({}),
    forwardRef(() => AuthModule),
  ],
  exports: [UsersService],
  providers: [UsersService,
    {
      provide: 'UPLOAD_PATH',
      useValue: process.env.PATH_PUBLIC_IMAGE_AVATAR
    }
  ],
})
export class UsersModule { }
