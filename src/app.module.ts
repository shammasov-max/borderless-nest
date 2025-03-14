
import { Module } from '@nestjs/common';
import { HelloModule } from './hello/hello.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { SubgraphProxyModule } from './subgraph-proxy/subgraph-proxy.module';

@Module({

    imports: [
        DevtoolsModule.register({
          port:8001,
          http: process.env.NODE_ENV !== 'production',
        }), 
        HelloModule,
        SubgraphProxyModule,
      ]
   
})
export class AppModule {}