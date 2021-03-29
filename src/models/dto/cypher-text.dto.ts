import { ApiProperty } from '@nestjs/swagger';

export class CypherTextDto {

  @ApiProperty({
    description: 'Intro value',
    minLength: 1,
    maxLength: 30,
    type: 'string'
  })
  text: string;
}