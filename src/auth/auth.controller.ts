import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { registerDto } from './dto/register.dto';
import { JwtGuard } from 'src/guards/jwt/jwt.guard';
import { LoginDto } from './dto/login.dto';
import { ROLE_LEVEL } from 'ultil/types';
import { Roles } from 'src/decorators/role/roles.decorator';
import { RoleGuard } from 'src/guards/role/role.guard';
import { OwnerGuard } from 'src/guards/owner/owner.guard';
import { CompositeGuardMixin } from 'src/guards/composite/composite.guard';
import { CompositeGuardDecorator } from 'src/decorators/composite-guard/composite-guard.decorator';
import { ResourceInfo } from 'src/decorators/resource-info/resource-info.decorator';


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


  @ApiBearerAuth("access-token")
  @UseGuards(JwtGuard, CompositeGuardMixin())
  @CompositeGuardDecorator(RoleGuard, OwnerGuard)
  @Roles(ROLE_LEVEL.ADMIN)
  @ResourceInfo({
    table : "test_owner",
    field : "renter_id" 
  })
  @Get("/test-role/:resourceId(\\d+)")
  testRole(@Param("resourceId", ParseIntPipe) resourceId: number){
    return "role " + resourceId;
  }
}
