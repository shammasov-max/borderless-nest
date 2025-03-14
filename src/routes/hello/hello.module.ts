import { Module } from '@nestjs/common';
import { DevtoolsModule } from '@nestjs/devtools-integration'
import { HelloController } from './hello.controller';
import { HelloService } from './hello.service';

@Module({
  controllers: [HelloController],
  providers: [HelloService],
})
export class HelloModule {}
