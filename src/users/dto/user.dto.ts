import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";


export class UserInfoDto {
    email: string;
    role: string;
    id: number;
    fullname: string;
    gender: string;
    phone: string;
    birth_day: string;
    avatar?: string;
}

export class UpdateRoleDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ type: "number", example: 2 })
    role_id: number

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({ type: "number", example: 0 })
    user_id: number
}