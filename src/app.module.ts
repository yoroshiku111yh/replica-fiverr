import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { JwtModule } from '@nestjs/jwt';
import { SkillsModule } from './skills/skills.module';
import { GigCatesModule } from './gig-cates/gig-cates.module';
import { GigsModule } from './gigs/gigs.module';
import { GigBookingModule } from './gig-booking/gig-booking.module';
import { CommentModule } from './comment/comment.module';
import { ThrottlerModule } from '@nestjs/throttler';

const publicPath = join(__dirname, '..', '..', 'public');
Logger.log(`Serving static files from: ${publicPath}`);

@Module({
  imports: [
    AuthModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    JwtModule.register({}),
    ConfigModule.forRoot(
      {
        envFilePath: ".env",
        isGlobal: true
      }
    ),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "..", "public"),
    }),
    UsersModule,
    SkillsModule,
    GigCatesModule,
    GigsModule,
    GigBookingModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule { }
