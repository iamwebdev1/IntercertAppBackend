import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {
  constructor() {}

  @Get('mytest')
  getHello(): string {
    return "This is only testing purpose";
  }
}
