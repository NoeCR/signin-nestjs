import { IsString, Length } from 'class-validator';

export class CypherTextDto {

  @IsString()
  @Length(1, 30)
  text: string;
}