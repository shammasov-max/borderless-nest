import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { RedisService } from '../../redis/redis.service'

const ttlsByMethods = {
  eth_gasPrice: 5,
  eth_blockNumber: 5,
  eth_getBalance: 30
}

const getCacheTTLByMethod = (method: string) => 
  ttlsByMethods[method] || 0

const defaultRPCProps = {
  method: "eth_gasPrice",
  params: [],
  id: 1,
  jsonrpc: "2.0",
}

const CHAINSTACK_BASE_RPC = process.env.CHAINSTACK_BASE_RPC || "https://ethereum-mainnet.core.chainstack.com/5087a79a7f0983174800429f868331cc"

const CHAINSTACK_RPC = process.env.CHAINSTACK_RPC || "https://ethereum-mainnet.core.chainstack.com/5087a79a7f0983174800429f868331cc"

const getUrlByChain = (chain: string) =>
    chain === "base" ? CHAINSTACK_BASE_RPC : CHAINSTACK_RPC;

@Injectable()
export class WagmiService {
  constructor(private readonly httpService: HttpService, private readonly redisService: RedisService) {}


  public async fetchData(chain: string, params: any) {
    const url = getUrlByChain(chain)
    const response = await this.httpService.axiosRef.get(url,{params})
    return response.data
  }

  public async callRPC(chain: string, body: any){
    const url = getUrlByChain(chain)
    console.log({chain, url})
    const { method = 'eth_gasPrice', params = [], id = 1, jsonrpc = '2.0' } = body

    const ttl = getCacheTTLByMethod(method)
    if (ttl) {
      let cacheKey = `blockchain_info:${chain}:${method}`;

      let cachedData: any = null;
      const value = await this.redisService.get(cacheKey)
      if (params.length === 0 ) {

        if(value) {
          try {
          cachedData = await this.redisService.get(cacheKey);
          } catch (e) {
            console.error(e)
          }
        }
      } else {
        cacheKey = `blockchain_info:${chain}:${method}:${params.join(":")}`;
      
        //FT.CREATE blockchain_info_params ON JSON SCHEMA $.params[*] AS param TAG
        const paramsTags = params.map((param) => `@param:{${param}}`).join(" ");
        console.log(paramsTags);
        //@param:{0x987e55d51A9939B2cEE2F16d1A946cC1F7bFaEF6} @param:{latest}
        const searchResults = await this.redisService.call(
          "FT.SEARCH",
          "blockchain_info_params",
          paramsTags,
          "LIMIT",
          "0",
          "1"
        );
        console.log(searchResults);

        cachedData =searchResults 
           ? searchResults[0] > 0 ? searchResults[2][1] : null
           : undefined
        console.log("cachedData", cachedData);
      }

      const reponse_to_client = {
        jsonrpc,
        id,
        result: null,
      };
      if (cachedData) {
        const cachedDataParsed = JSON.parse(cachedData);
        reponse_to_client.result = cachedDataParsed?.result || cachedDataParsed;
      } else {
        const response = await this.httpService.axiosRef.post(url, body, {
          // headers: req.headers
        });
        const { result } = response.data;

        const dataToCache = JSON.stringify({ params, result });
        reponse_to_client.result = result;

        await this.redisService.set( cacheKey,   dataToCache);
        await this.redisService.redisClient.set("EXPIRE", cacheKey, ttl);
      }
      return reponse_to_client;
    }

    const response = await this.httpService.axiosRef.post(url, body, {});
    return response.data
  }

}
