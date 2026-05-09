import { IsString, MinLength } from 'class-validator'

export class RefineDraftDto {
  @IsString()
  @MinLength(1)
  feedback: string
}
