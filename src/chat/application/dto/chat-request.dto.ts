import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  question!: string;
}
