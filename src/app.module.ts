
import { Module } from '@nestjs/common';
import { HelloModule } from './routes/hello/hello.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { SubgraphProxyModule } from './routes/subgraph-proxy/subgraph-proxy.module';
import { ConfigModule } from '@nestjs/config';
import { WagmiModule } from './routes/wagmi/wagmi.module';
import configuration from './config/configuration';
import { RedisModule } from './redis/redis.module';

@Module({
    imports: [
        DevtoolsModule.register({
          port:8001,
          http: process.env.NODE_ENV !== 'production',
        }), 
        ConfigModule.forRoot({
          load: [configuration],
          isGlobal: true,
        }),
        HelloModule,
        RedisModule,
        SubgraphProxyModule,
        WagmiModule,
      ]
   
})
export class AppModule {}