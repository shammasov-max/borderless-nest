"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_constant_1 = require("./redis.constant");
const core_1 = require("@nestjs/core");
const redis_service_1 = require("./redis.service");
let RedisModule = class RedisModule {
    moduleRef;
    constructor(moduleRef) {
        this.moduleRef = moduleRef;
    }
    async onApplicationShutdown(signal) {
        return new Promise((resolve) => {
            const redis = this.moduleRef.get(redis_constant_1.IORedisKey);
            redis.quit();
            redis.on('end', () => {
                resolve();
            });
        });
    }
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            {
                provide: redis_constant_1.IORedisKey,
                useFactory: redis_constant_1.redisProviderFactory,
                inject: [config_1.ConfigService],
            },
            redis_service_1.RedisService,
        ]
    }),
    __metadata("design:paramtypes", [core_1.ModuleRef])
], RedisModule);
//# sourceMappingURL=redis.module.js.map