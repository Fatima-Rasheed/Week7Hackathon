import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Accessible at /api (due to global prefix)
  @Get()
  getHello() {
    return this.appService.getHello();
  }
}
