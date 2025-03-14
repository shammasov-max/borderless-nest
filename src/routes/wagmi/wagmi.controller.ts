import { Controller, Post, Body, HttpException, HttpStatus, Param, Get, Query } from '@nestjs/common';
import { WagmiService } from './wagmi.service';
import { HttpService } from '@nestjs/axios';

import { firstValueFrom } from 'rxjs';

@Controller('api')
export class WagmiController {
  constructor(private readonly wagmiService: WagmiService) {}

  @Post(':chain/wagmi')
  async callRPC(@Param('chain') chain: string, @Body() body: any) {
    return this.wagmiService.callRPC(chain, body)
  }
  
  @Get(':chain/wagmi')
  async getData(@Param('chain') chain: string, @Query() query) {
    
    return this.wagmiService.fetchData(chain, query)
  }

 

}
