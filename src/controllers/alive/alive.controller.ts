import { Controller, Get } from '@nestjs/common';

@Controller('alive')
export class AliveController {

  @Get()
  alive() {
    return { version: process.env.npm_package_version };
  }
}
