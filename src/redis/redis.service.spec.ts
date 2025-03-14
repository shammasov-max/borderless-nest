import { Test, TestingModule } from '@nestjs/testing';
import { Redis  as R} from 'ioredis';
import {  RedisService } from './redis.service';
import { IORedisKey } from './redis.constant';
import { RedisModule } from './redis.module';
import { ConfigModule } from '@nestjs/config';
import { WagmiModule } from '../routes/wagmi/wagmi.module';

describe('RedisService',   () => {
  let service: RedisService;

  beforeEach(async () =>{
    const module: TestingModule = await Test.createTestingModule({
   imports:[
      RedisModule,
     
      ConfigModule.forRoot({
       isGlobal: true,
     })
   ],



 }).compile();

     service = module.get<RedisService>(RedisService);
   
 })
 
 

it('redis should be clear', async () =>{
  expect(await service.clear()).toBeDefined()
})

   it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  it('should be clear', async () => {
    expect(service).toBeDefined();
    expect(await service.getKeys('*')).toEqual([])
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
        expect(await service.get('testKey')).toBeFalsy()
    });
  
    it('should return true if stored value matches the provided value', async () => {
 
      const isValid = await service.validate('someKey', 'storedValue');
      expect(isValid).toBe(true)
    });

    it('should return false if stored value does not match the provided value', async () => {

      const isValid = await service.validate('someKey', 'mySecrdet');
      expect(isValid).toBe(false)
    });
  
 });
