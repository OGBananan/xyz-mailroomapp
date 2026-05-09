import { IsString, IsOptional, MinLength } from 'class-validator'

export class ComposeEmailDto {
  @IsString()
  @MinLength(1)
  to: string

  @IsOptional()
  @IsString()
  cc?: string

  @IsOptional()
  @IsString()
  bcc?: string

  @IsString()
  @MinLength(1)
  subject: string

  @IsString()
  @MinLength(1)
  body: string
}
