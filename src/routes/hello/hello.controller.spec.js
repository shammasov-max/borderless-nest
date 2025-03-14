"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const hello_controller_1 = require("./hello.controller");
const hello_service_1 = require("./hello.service");
describe('HelloController', () => {
    let appController;
    beforeEach(async () => {
        const app = await testing_1.Test.createTestingModule({
            controllers: [hello_controller_1.HelloController],
            providers: [hello_service_1.HelloService],
        }).compile();
        appController = app.get(hello_controller_1.HelloController);
    });
    describe('root', () => {
        it('should return "Hello World!"', () => {
            expect(appController.index()).toBeTruthy();
        });
    });
});
//# sourceMappingURL=hello.controller.spec.js.map