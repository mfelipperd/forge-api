"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = modelRoutes;
var modelController_1 = require("../controllers/modelController");
/**
 * Rotas para gerenciar modelos 3D e propriedades IFC
 */
function modelRoutes(app) {
    // Obter URN do modelo principal
    app.get("/api/model/urn", modelController_1.default.getModelUrn);
    // REMOVIDO: Listar modelos - agora usa /api/models do modelsRoutes.ts
    // app.get("/api/models", modelController.listModels);
    // Iniciar tradução do modelo
    app.post("/api/model/translate", modelController_1.default.translateModel);
    // Verificar status da tradução
    app.get("/api/model/:urn/status", modelController_1.default.getTranslationStatus);
    // Obter todas as propriedades de um modelo
    app.get("/api/model/:urn/properties", modelController_1.default.getModelProperties);
    // Análise completa do modelo IFC
    app.get("/api/model/:urn/analyze", modelController_1.default.analyzeIFCModel);
}
