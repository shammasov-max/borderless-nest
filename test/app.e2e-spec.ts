import { Test, TestingModule } from '@nestjs/testing';
import { INestHellolication } from '@nestjs/common';
import * as request from 'supertest';
import { Hello } from 'supertest/types';
import { HelloModule } from '../src/hello/hello.module';

describe('HelloController (e2e)', () => {
  let app: INestHellolication<Hello>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HelloModule],
    }).compile();

    app = moduleFixture.createNestHellolication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
