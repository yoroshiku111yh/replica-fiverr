import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class SubGigCateDto {
    @ApiProperty({example : "Wireframing"})
    @IsNotEmpty()
    name : string;
    @ApiProperty({example : "Wireframing's description"})
    description : string;
}