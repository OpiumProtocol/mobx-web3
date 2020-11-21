"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientName = exports.ProviderType = exports.ProviderName = exports.AuthType = void 0;
var AuthType;
(function (AuthType) {
    AuthType["WALLET_CONNECT"] = "walletconnect";
    AuthType["INJECTED"] = "injected";
    AuthType["FORTMATIC"] = "fortmatic";
})(AuthType = exports.AuthType || (exports.AuthType = {}));
var ProviderName;
(function (ProviderName) {
    ProviderName["MetaMask"] = "MetaMask";
    ProviderName["WalletConnect"] = "WalletConnect";
    ProviderName["Trust"] = "Trust";
    ProviderName["Fortmatic"] = "Fortmatic";
    ProviderName["Cipher"] = "Cipher";
    ProviderName["Coinbase"] = "Coinbase";
    ProviderName["Dapper"] = "Dapper";
    ProviderName["Web3"] = "Web3";
    ProviderName["Unknown"] = "Unknown";
})(ProviderName = exports.ProviderName || (exports.ProviderName = {}));
var ProviderType;
(function (ProviderType) {
    ProviderType["injected"] = "injected";
    ProviderType["qrcode"] = "qrcode";
    ProviderType["web"] = "web";
    ProviderType["unknown"] = "unknown";
})(ProviderType = exports.ProviderType || (exports.ProviderType = {}));
var ClientName;
(function (ClientName) {
    ClientName["UNKNOWN"] = "UNKNOWN";
    ClientName["ART_WALLET"] = "ART_WALLET";
    ClientName["OPIUM_WALLET"] = "OPIUM_WALLET";
    ClientName["OFI_WALLET"] = "OFI_WALLET";
})(ClientName = exports.ClientName || (exports.ClientName = {}));
