import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";

export class registerDto {
    @ApiProperty({ example: "user@example.com" })
    @IsNotEmpty()
    @IsEmail()
    email: string;
    ////
    @ApiProperty({ example: "123456haha" })
    @IsNotEmpty()
    @Matches(/^(?=.*\d)[A-Za-z\d]{8,15}$/, {
        message: 'Password must be between 8 and 15 characters and contain at least one number',
    })
    password: string;
    ////
    @ApiProperty({ example: "elizabeth kiki" })
    @MaxLength(30, { message: "Fullname cannot be longer than 30 characters" })
    @IsNotEmpty()
    fullname: string;
    ////
    @ApiProperty({ example: "01234567890" })
    @IsString()
    @Matches(/^\+?[0-9]\d{1,14}$/, { message: 'Invalid phone number format' })
    phone: string;

    @ApiProperty({ example: "Male" })
    @IsString()
    gender: string;

    @ApiProperty({ example: "09/09/1993" })
    @IsString()
    birthday: string;

    @ApiProperty({ example: ["Reactjs", "Redux", "Html", "Css"] })
    @IsArray()
    skill: string[];

    @ApiProperty({ example: ["certi1", "certi2"] })
    @IsArray()
    certification: string[];
}

// {
//     "id": 0,
//     "name": "string",
//     "email": "string",
//     "password": "string",
//     "phone": "string",
//     "birthday": "string",
//     "gender": true,
//     "role": "string",
//     "skill": [
//       "string"
//     ],
//     "certification": [
//       "string"
//     ]