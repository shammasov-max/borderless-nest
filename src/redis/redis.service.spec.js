"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const redis_service_1 = require("./redis.service");
const redis_module_1 = require("./redis.module");
const config_1 = require("@nestjs/config");
describe('RedisService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            imports: [
                redis_module_1.RedisModule,
                config_1.ConfigModule.forRoot({
                    isGlobal: true,
                })
            ],
        }).compile();
        service = module.get(redis_service_1.RedisService);
    });
    it('redis should be clear', async () => {
        expect(await service.clear()).toBeDefined();
    });
    it('should be defined', async () => {
        expect(service).toBeDefined();
    });
    it('should be clear', async () => {
        expect(service).toBeDefined();
        expect(await service.getKeys('*')).toEqual([]);
    });
    it('should return an empty array if no keys found', async () => {
        const result = await service.getKeys('no-match');
        expect(result).toEqual([]);
    });
    it('should set a key-value pair without expiry when expireInSeconds is undefined', async () => {
        await service.set('testKey', 'testValue');
    });
    it('should set a key-value pair with expiry when expireInSeconds is provided', async () => {
        await service.set('testKey', 'testValue', 30);
    });
    it('should return the value for a given key', async () => {
        await service.set('someKey', 'storedValue', 30);
        const value = await service.get('someKey');
        expect(value).toBe('storedValue');
    });
    it('should call redis.del for the given key', async () => {
        await service.delete('testKey');
        expect(await service.get('testKey')).toBeFalsy();
    });
    it('should return true if stored value matches the provided value', async () => {
        const isValid = await service.validate('someKey', 'storedValue');
        expect(isValid).toBe(true);
    });
    it('should return false if stored value does not match the provided value', async () => {
        const isValid = await service.validate('someKey', 'mySecrdet');
        expect(isValid).toBe(false);
    });
});
//# sourceMappingURL=redis.service.spec.js.map