import { HelloService } from "./hello.service";
export declare class HelloController {
    private readonly appService;
    constructor(appService: HelloService);
    index(): string;
}
