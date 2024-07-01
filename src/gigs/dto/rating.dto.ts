import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";


export class RatingDto {
    @ApiProperty({ example: "3", description: "Gig rating stars" })
    @IsNotEmpty()
    @IsNumber()
    stars: number;
}