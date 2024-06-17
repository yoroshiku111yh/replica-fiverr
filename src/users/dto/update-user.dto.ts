import { OmitType, PartialType } from '@nestjs/swagger';
import { registerDto } from 'src/auth/dto/register.dto';

export class UpdateUserDto extends PartialType(OmitType(registerDto, ["password", "email", "certification"] as const)) {}
