import { Controller, Get } from "@nestjs/common";
import { HelloService } from "./hello.service";

@Controller()
export class HelloController {
  constructor(private readonly appService: HelloService) {}

  @Get()
  index(): string {
    return this.appService.getHello();
  }
}
