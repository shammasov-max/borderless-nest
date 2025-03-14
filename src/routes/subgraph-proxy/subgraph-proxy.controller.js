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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubgraphProxyController = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
let SubgraphProxyController = class SubgraphProxyController {
    httpService;
    constructor(httpService) {
        this.httpService = httpService;
    }
    async fetchSubgraph(url, body) {
        try {
            const response = await this.httpService.axiosRef.post(url, body, {});
            return response.data;
        }
        catch (error) {
            console.error(error);
            throw new common_1.HttpException('Error calling subgraph ' + url, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async subgraph(body) {
        return this.fetchSubgraph("https://api.studio.thegraph.com/query/26374/nap-graph/version/latest", body);
    }
    async subgraph1(body) {
        return this.fetchSubgraph('https://api.studio.thegraph.com/query/26374/bcp-staking-graph/version/latest', body);
    }
    async subgraph2(body) {
        return this.fetchSubgraph('https://api.studio.thegraph.com/query/26374/nap-factory-graph/version/latest', body);
    }
    async subgraph3(body) {
        return this.fetchSubgraph('https://api.studio.thegraph.com/query/26374/nap-factory-base/version/latest', body);
    }
};
exports.SubgraphProxyController = SubgraphProxyController;
__decorate([
    (0, common_1.Post)('subgraph'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubgraphProxyController.prototype, "subgraph", null);
__decorate([
    (0, common_1.Post)('subgraph1'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubgraphProxyController.prototype, "subgraph1", null);
__decorate([
    (0, common_1.Post)('subgraph2'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubgraphProxyController.prototype, "subgraph2", null);
__decorate([
    (0, common_1.Post)('subgraph3'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubgraphProxyController.prototype, "subgraph3", null);
exports.SubgraphProxyController = SubgraphProxyController = __decorate([
    (0, common_1.Controller)('api/test'),
    __metadata("design:paramtypes", [axios_1.HttpService])
], SubgraphProxyController);
//# sourceMappingURL=subgraph-proxy.controller.js.map