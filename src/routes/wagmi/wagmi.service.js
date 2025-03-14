"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WagmiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const redis_service_1 = require("../../redis/redis.service");
const ttlsByMethods = {
    eth_gasPrice: 5,
    eth_blockNumber: 5,
    eth_getBalance: 30
};
const getCacheTTLByMethod = (method) => ttlsByMethods[method] || 0;
const defaultRPCProps = {
    method: "eth_gasPrice",
    params: [],
    id: 1,
    jsonrpc: "2.0",
};
const CHAINSTACK_BASE_RPC = process.env.CHAINSTACK_BASE_RPC || "https://ethereum-mainnet.core.chainstack.com/5087a79a7f0983174800429f868331cc";
const CHAINSTACK_RPC = process.env.CHAINSTACK_RPC || "https://ethereum-mainnet.core.chainstack.com/5087a79a7f0983174800429f868331cc";
const getUrlByChain = (chain) => chain === "base" ? CHAINSTACK_BASE_RPC : CHAINSTACK_RPC;
let WagmiService = class WagmiService {
    httpService;
    redisService;
    constructor(httpService, redisService) {
        this.httpService = httpService;
        this.redisService = redisService;
    }
    async fetchData(chain, params) {
        const url = getUrlByChain(chain);
        const response = await this.httpService.axiosRef.get(url, { params });
        return response.data;
    }
    async callRPC(chain, body) {
        const url = getUrlByChain(chain);
        console.log({ chain, url });
        const { method = 'eth_gasPrice', params = [], id = 1, jsonrpc = '2.0' } = body;
        const ttl = getCacheTTLByMethod(method);
        if (ttl) {
            let cacheKey = `blockchain_info:${chain}:${method}`;
            let cachedData = null;
            const value = await this.redisService.get(cacheKey);
            if (params.length === 0) {
                if (value) {
                    try {
                        cachedData = await this.redisService.get(cacheKey);
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
            else {
                cacheKey = `blockchain_info:${chain}:${method}:${params.join(":")}`;
                const paramsTags = params.map((param) => `@param:{${param}}`).join(" ");
                console.log(paramsTags);
                const searchResults = await this.redisService.call("FT.SEARCH", "blockchain_info_params", paramsTags, "LIMIT", "0", "1");
                console.log(searchResults);
                cachedData = searchResults
                    ? searchResults[0] > 0 ? searchResults[2][1] : null
                    : undefined;
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
            }
            else {
                const response = await this.httpService.axiosRef.post(url, body, {});
                const { result } = response.data;
                const dataToCache = JSON.stringify({ params, result });
                reponse_to_client.result = result;
                await this.redisService.set(cacheKey, dataToCache);
                await this.redisService.redisClient.set("EXPIRE", cacheKey, ttl);
            }
            return reponse_to_client;
        }
        const response = await this.httpService.axiosRef.post(url, body, {});
        return response.data;
    }
};
exports.WagmiService = WagmiService;
exports.WagmiService = WagmiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService, redis_service_1.RedisService])
], WagmiService);
//# sourceMappingURL=wagmi.service.js.map