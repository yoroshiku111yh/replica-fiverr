import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber } from "class-validator";


export class UploadGigDto {
    @ApiProperty({example : "Gig name"})
    @IsNotEmpty()
    name : string;

    @ApiProperty({example : "Gig description"})
    @IsNotEmpty()
    description : string;

    @ApiProperty({example : 0, required : false})
    @IsNumber()
    @Type(() => Number)
    stars : number;

    @ApiProperty({example : "Gig detail"})
    @IsNotEmpty()
    detail : string;

    @ApiProperty({example : 100})
    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    price : number;

    @ApiProperty({ type: "string", example: "[1, 2, 3]" })
    @IsNotEmpty()
    cates: string;
}