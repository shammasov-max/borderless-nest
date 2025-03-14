import { Module } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { SubgraphProxyService } from './subgraph-proxy.service';
import { SubgraphProxyController } from './subgraph-proxy.controller';

@Module({
  imports: [
    HttpModule 
  ],
  controllers: [SubgraphProxyController],

})
export class SubgraphProxyModule {}