"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const hello_module_1 = require("./routes/hello/hello.module");
const devtools_integration_1 = require("@nestjs/devtools-integration");
const subgraph_proxy_module_1 = require("./routes/subgraph-proxy/subgraph-proxy.module");
const config_1 = require("@nestjs/config");
const wagmi_module_1 = require("./routes/wagmi/wagmi.module");
const configuration_1 = require("./config/configuration");
const redis_module_1 = require("./redis/redis.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            devtools_integration_1.DevtoolsModule.register({
                port: 8001,
                http: process.env.NODE_ENV !== 'production',
            }),
            config_1.ConfigModule.forRoot({
                load: [configuration_1.default],
                isGlobal: true,
            }),
            hello_module_1.HelloModule,
            redis_module_1.RedisModule,
            subgraph_proxy_module_1.SubgraphProxyModule,
            wagmi_module_1.WagmiModule,
        ]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map