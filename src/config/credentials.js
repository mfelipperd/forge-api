"use strict";
/**
 * Configuração das credenciais do Autodesk Forge
 * Baseado no repositório: https://github.com/MjMthimunye/MERN-Stack-Revit-Forge-Viewer
 */
Object.defineProperty(exports, "__esModule", { value: true });
var credentials = {
    credentials: {
        client_id: process.env.FORGE_CLIENT_ID || "your_client_id",
        client_secret: process.env.FORGE_CLIENT_SECRET || "your_client_secret",
        grant_type: "client_credentials",
        scope: "data:read data:write data:create viewables:read",
    },
    // Autodesk Forge base URL (usando API v2 para OAuth 2.0)
    BaseUrl: "https://developer.api.autodesk.com",
    Version: "v2",
    Authentication: "",
};
// Construir URL de autenticação (v2/token para OAuth 2.0)
credentials.Authentication = "".concat(credentials.BaseUrl, "/authentication/").concat(credentials.Version, "/token");
// Debug das variáveis de ambiente
console.log("🔍 Debug Credenciais:");
console.log("FORGE_CLIENT_ID:", process.env.FORGE_CLIENT_ID ? "Definido" : "Não definido");
console.log("FORGE_CLIENT_SECRET:", process.env.FORGE_CLIENT_SECRET ? "Definido" : "Não definido");
console.log("Client ID usado:", credentials.credentials.client_id.substring(0, 10) + "...");
exports.default = credentials;
