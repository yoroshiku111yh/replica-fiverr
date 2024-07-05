import { OmitType } from "@nestjs/swagger";
import { UploadGigDto } from "./upload-gig.dto";

export class EditGigDto extends OmitType(UploadGigDto, ['imageGig'] as const) { }