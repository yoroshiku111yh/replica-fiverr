import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { registerDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags } from '@nestjs/swagger';


@ApiTags("Auth")
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("/signup")
  register(@Body() data: registerDto) {
    return this.authService.register(data);
  }

  @Post("/signin")
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }
}
