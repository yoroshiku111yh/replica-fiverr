import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber } from "class-validator";


export class SkillsIdDto {
    @ApiProperty({ type: "array", items: { type: 'number' }, example: [1, 2, 3] })
    @IsNotEmpty()
    @IsNumber({}, { each: true })
    @IsArray()
    skillsId: number[]
}