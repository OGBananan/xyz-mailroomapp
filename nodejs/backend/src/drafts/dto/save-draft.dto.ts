import { IsString, MinLength } from 'class-validator'

export class SaveDraftDto {
  @IsString()
  @MinLength(1)
  body: string
}
