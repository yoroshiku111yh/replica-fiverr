import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsNumber } from "class-validator";


export class PostBooking {
    @ApiProperty({ example: "13", description: "Gig id" })
    @IsNotEmpty()
    @IsNumber()
    gig_id: number;

    @ApiProperty({ example: "2024-07-07", description: "deadline date type" })
    endAt: string;

    @ApiProperty({ example: "booking's name", description: "booking name" })
    @IsNotEmpty()
    name_booking : string;

    @ApiProperty({ example: "100", description: "Price in range budget of Gig" })
    @IsNotEmpty()
    @IsNumber()
    price: number;
}

