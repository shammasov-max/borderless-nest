import { Module } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { SubgraphProxyService } from './subgraph-proxy.service';
import { SubgraphProxyController } from './subgraph-proxy.controller';

@Module({
  imports: [
    HttpModule // Подключаем, чтобы удобно работать с HTTP-запросами через this.httpService
  ],
  controllers: [SubgraphProxyController],
  providers: [HttpService],
})
export class SubgraphProxyModule {}