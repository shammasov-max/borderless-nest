"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisProviderFactory = exports.IORedisKey = void 0;
const ioredis_1 = require("ioredis");
exports.IORedisKey = 'IORedisKey';
const redisProviderFactory = async () => {
    return new ioredis_1.default({ port: Number(process.env.REDIS_PORT), host: '127.0.0.1' });
};
exports.redisProviderFactory = redisProviderFactory;
//# sourceMappingURL=redis.constant.js.map