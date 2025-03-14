const eth_blockNumberMessage = {"method":"eth_blockNumber", "jsonrpc":"2.0", "params":[],"id":1} 

import { Test, TestingModule } from '@nestjs/testing';
import { WagmiController } from './wagmi.controller';
import { WagmiService } from './wagmi.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { WagmiModule } from './wagmi.module';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';
import { RedisModule } from '../../redis/redis.module';

describe('SubgraphPController', () => {
  let controller: WagmiController;
  let service: WagmiService;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[
      
        RedisModule,
        WagmiModule,
        ConfigModule.forRoot({
          isGlobal: true,
        })
      ],
    }).compile();


    controller = module.get<WagmiController>(WagmiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });



  describe('wagmi.controller', () => {
    it('callRPC '+JSON.stringify(eth_blockNumberMessage), async () => {

      // Act

      const chain = 'base'
      const body = eth_blockNumberMessage
      
      
      const result = await controller.callRPC(chain, eth_blockNumberMessage);
      console.log({})
      // Assert
      expect(result).toBeTruthy()
    }
  )
    it('callRPC '+JSON.stringify(eth_blockNumberMessage), async () => {

      // Act
      const chain = 'base'
      const body = eth_blockNumberMessage
      const result = await controller.callRPC(chain, eth_blockNumberMessage);
      console.log({})
      // Assert
      expect(result).toBeTruthy()
    }
  )
  });

});