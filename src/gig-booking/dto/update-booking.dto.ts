import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsNumber } from "class-validator";


export class UpdateBooking {
    @ApiProperty({ example: "2024-07-08", description: "deadline date" })
    @IsDateString()
    endAt: string;
    
    @ApiProperty({ example : "2", description : "status id completed"})
    @IsNumber()
    status_id : number;

    @ApiProperty({ example: "booking's name", description: "booking name" })
    @IsNotEmpty()
    name_booking : string
}