import { Express } from "express";
import modelController from "../controllers/modelController";

/**
 * Rotas para gerenciar modelos 3D e propriedades IFC
 */
export default function modelRoutes(app: Express): void {
  // Obter URN do modelo principal
  app.get("/api/model/urn", modelController.getModelUrn);

  // REMOVIDO: Listar modelos - agora usa /api/models do modelsRoutes.ts
  // app.get("/api/models", modelController.listModels);

  // Iniciar tradução do modelo
  app.post("/api/model/translate", modelController.translateModel);

  // Verificar status da tradução
  app.get("/api/model/:urn/status", modelController.getTranslationStatus);

  // Obter todas as propriedades de um modelo
  app.get("/api/model/:urn/properties", modelController.getModelProperties);

  // Análise completa do modelo IFC
  app.get("/api/model/:urn/analyze", modelController.analyzeIFCModel);
}
