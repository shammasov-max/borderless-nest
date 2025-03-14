const gqlQuery = `{
    collections {
    id,
    owner,
    supply,
    nftType,
    }
}`


import { Test, TestingModule } from '@nestjs/testing';
import { SubgraphProxyController } from './subgraph-proxy.controller';
import { SubgraphProxyService } from './subgraph-proxy.service';
import { HttpModule, HttpService } from '@nestjs/axios';

describe('SubgraphPController', () => {
    let controller: SubgraphProxyController;
    let service: SubgraphProxyService;


    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [HttpModule],
            controllers: [SubgraphProxyController],

        }).compile();

        controller = module.get<SubgraphProxyController>(SubgraphProxyController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });


    describe('subgraph (POST /api/test/subgraph)', () => {
        it('should call SubgraphProxyController.subgraph and return data', async () => {

            // Act
            const body = { query: gqlQuery };
            const result = await controller.subgraph(body);

            // Assert
            expect(result).toBeTruthy()
        }
        )
    });
    describe('subgraph (POST /api/test/subgraph1)', () => {
        it('should call SubgraphProxyController.subgraph1 and return data', async () => {

            // Act
            const body = { query: gqlQuery };
            const result = await controller.subgraph1(body);

            // Assert
            expect(result).toBeTruthy()
        }
        )
    });


    describe('subgraph (POST /api/test/subgraph2)', () => {
        it('should call SubgraphProxyController.subgraph2 and return data', async () => {
            // Act
            const body = { query: gqlQuery };
            const result = await controller.subgraph2(body);
            // Assert
            expect(result).toBeTruthy()
        }
        )
    });

    describe('subgraph (POST /api/test/subgraph3)', () => {
        it('should call SubgraphProxyController.subgraph3 and return data', async () => {

            // Act
            const body = { query: gqlQuery };
            const result = await controller.subgraph3(body);

            // Assert
            expect(result).toBeTruthy()
        }
        )
    });
});