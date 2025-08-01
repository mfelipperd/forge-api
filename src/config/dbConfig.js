"use strict";
/**
 * Configuração do banco de dados MongoDB
 * Baseado no repositório original
 */
Object.defineProperty(exports, "__esModule", { value: true });
var dbConfig = {
    localUrl: process.env.MONGO_LOCAL_URL || "mongodb://localhost:27017/forge-viewer",
    cloudUrl: process.env.MONGO_CLOUD_URL || "your_mongo_atlas_connection_string",
};
exports.default = dbConfig;
