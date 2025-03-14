"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WagmiModule = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const wagmi_service_1 = require("./wagmi.service");
const wagmi_controller_1 = require("./wagmi.controller");
const redis_service_1 = require("../../redis/redis.service");
const redis_constant_1 = require("../../redis/redis.constant");
const config_1 = require("@nestjs/config");
let WagmiModule = class WagmiModule {
};
exports.WagmiModule = WagmiModule;
exports.WagmiModule = WagmiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            axios_1.HttpModule
        ],
        controllers: [wagmi_controller_1.WagmiController],
        providers: [{
                provide: redis_constant_1.IORedisKey,
                useFactory: redis_constant_1.redisProviderFactory,
                inject: [config_1.ConfigService],
            }, wagmi_service_1.WagmiService, redis_service_1.RedisService,],
        exports: [axios_1.HttpModule]
    })
], WagmiModule);
//# sourceMappingURL=wagmi.module.js.map