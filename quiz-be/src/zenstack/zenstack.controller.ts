import { All, Controller } from '@nestjs/common';
import { ApiHandlerService } from '@zenstackhq/server/nestjs';

@Controller('api/model')
export class ZenstackController {
  constructor(private readonly apiHandler: ApiHandlerService) {}

  @All('*')
  handle() {
    return this.apiHandler.handleRequest({
      baseUrl: '/api/model',
    });
  }
}
