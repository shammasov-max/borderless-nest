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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const redis_constant_1 = require("./redis.constant");
let RedisService = class RedisService {
    redisClient;
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    async getKeys(pattern = '*') {
        return await this.redisClient.keys("PATTERN:" + pattern);
    }
    async set(key, value, expireInSeconds) {
        if (expireInSeconds) {
            await this.redisClient.set(key, value, 'EX', expireInSeconds);
        }
        else {
            await this.redisClient.set(key, value);
            console.log('this.redisClient.set(key, value)', await this.redisClient.set(key, value));
        }
    }
    async call(...args) {
        console.log('CALL , ', args.join());
        return await this.redisClient.call(...args);
    }
    async get(key) {
        return await this.redisClient.get(key);
    }
    async delete(key) {
        await this.redisClient.del(key);
    }
    async clear() {
        const keys = await this.redisClient.keys('PATTERN:*');
        if (keys.length)
            return await this.redisClient.del(keys);
        return 0;
    }
    async validate(key, value) {
        const storedValue = await this.redisClient.get(key);
        return storedValue === value;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(redis_constant_1.IORedisKey)),
    __metadata("design:paramtypes", [ioredis_1.Redis])
], RedisService);
//# sourceMappingURL=redis.service.js.map