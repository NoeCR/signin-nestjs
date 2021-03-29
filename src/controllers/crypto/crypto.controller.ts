import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CypherTextDto } from 'src/models/dto/cypher-text.dto';
import { CryptoService } from 'src/services/crypto/crypto.service';

@ApiTags('crypto')
@Controller('crypto')
export class CryptoController {

  constructor(private cryptoService: CryptoService) { }

  @Get()
  encrypt(@Query() cypherText: CypherTextDto) {
    return this.cryptoService.cipher(cypherText.text);
  }
}
