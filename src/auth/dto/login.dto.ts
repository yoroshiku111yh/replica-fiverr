import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, Matches } from "class-validator";


export class LoginDto {
    @ApiProperty({ example: "user@example.com" })
    @IsNotEmpty()
    @IsEmail()
    email: string;
    ////
    @ApiProperty({ example: "123456haha" })
    @IsNotEmpty()
    password: string;
}