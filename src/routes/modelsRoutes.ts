import { Router, Request, Response } from "express";
import { modelsController } from "../controllers/modelsController";

const router = Router();

/**
 * Rotas para gerenciamento de múltiplos modelos 3D
 */

// GET /api/models - Listar todos os modelos
router.get("/", modelsController.getAllModels);

// GET /api/models/stats - Estatísticas dos modelos
router.get("/stats", modelsController.getStats);

// POST /api/models/sync - Sincronizar todos os modelos com Forge
router.post("/sync", modelsController.syncAllModels);

// GET /api/models/:id - Obter modelo específico
router.get("/:id", modelsController.getModel);

// POST /api/models - Registrar novo modelo
router.post("/", modelsController.registerModel);

// PUT /api/models/:id - Atualizar modelo
router.put("/:id", modelsController.updateModel);

// DELETE /api/models/:id - Deletar modelo
router.delete("/:id", modelsController.deleteModel);

// GET /api/models/:id/status - Status de tradução do modelo
router.get("/:id/status", modelsController.getModelStatus);

// GET /api/models/:id/properties - Propriedades do modelo
router.get("/:id/properties", modelsController.getModelProperties);

// Admin endpoint - atualizar todos os modelos para success
router.post("/admin/mark-success", async (req, res) => {
  try {
    const Model = require("../models/Model").default;
    const result = await Model.updateMany(
      { status: "uploaded" },
      { status: "success", progress: "100%" }
    );

    const models = await Model.find({}, "name fileName status progress");

    res.json({
      success: true,
      message: `${result.modifiedCount} modelos atualizados`,
      models: models.map((m: any) => ({
        name: m.name,
        fileName: m.fileName,
        status: m.status,
        progress: m.progress,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

export default router;
