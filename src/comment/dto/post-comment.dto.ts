import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from "class-validator";


export class PostCommentDto {
    @IsNotEmpty()
    @MaxLength(200)
    @MinLength(1)
    @IsString()
    @ApiProperty({ example: "hello world", description: "comment" })
    comment : string
}