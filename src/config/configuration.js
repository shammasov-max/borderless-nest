"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    PORT: parseInt(process.env.PORT, 10) || 3000,
    REDIS_PORT: parseInt(process.env.REDIS_PORT, 10) || 6379,
    CHAINSTACK_RPC: String(process.env.CHAINSTACK_RPC ||
        "https://ethereum-mainnet.core.chainstack.com/5087a79a7f0983174800429f868331cc"),
    CHAINSTACK_BASE_RPC: String(process.env.CHAINSTACK_BASE_RPC ||
        "https://ethereum-mainnet.core.chainstack.com/5087a79a7f0983174800429f868331cc")
});
//# sourceMappingURL=configuration.js.map