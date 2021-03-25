import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { CypherTextDto } from 'src/models/dto/cypher-text.dto';
import { CryptoService } from 'src/services/crypto/crypto.service';

@ApiTags('crypto')
@Controller('crypto')
export class CryptoController {

  constructor(private cryptoService: CryptoService) { }

  @Post()
  @ApiBody({
    description: 'Encrypt the text entered',
  })
  encrypt(@Body() cypherText: CypherTextDto) {
    return this.cryptoService.cipher(cypherText.text);
  }
}
