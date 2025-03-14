"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eth_blockNumberMessage = { "method": "eth_blockNumber", "jsonrpc": "2.0", "params": [], "id": 1 };
const testing_1 = require("@nestjs/testing");
const wagmi_controller_1 = require("./wagmi.controller");
const wagmi_module_1 = require("./wagmi.module");
const config_1 = require("@nestjs/config");
const redis_module_1 = require("../../redis/redis.module");
describe('SubgraphPController', () => {
    let controller;
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            imports: [
                redis_module_1.RedisModule,
                wagmi_module_1.WagmiModule,
                config_1.ConfigModule.forRoot({
                    isGlobal: true,
                })
            ],
        }).compile();
        controller = module.get(wagmi_controller_1.WagmiController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
    describe('wagmi.controller', () => {
        it('callRPC ' + JSON.stringify(eth_blockNumberMessage), async () => {
            const chain = 'base';
            const body = eth_blockNumberMessage;
            const result = await controller.callRPC(chain, eth_blockNumberMessage);
            console.log({});
            expect(result).toBeTruthy();
        });
        it('callRPC ' + JSON.stringify(eth_blockNumberMessage), async () => {
            const chain = 'base';
            const body = eth_blockNumberMessage;
            const result = await controller.callRPC(chain, eth_blockNumberMessage);
            console.log({});
            expect(result).toBeTruthy();
        });
    });
});
//# sourceMappingURL=wagmi.controller.spec.js.map