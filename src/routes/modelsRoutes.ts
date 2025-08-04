import { Router, Request, Response } from "express";
import { modelsController } from "../controllers/modelsController";
import Model from "../models/Model";

const router = Router();

/**
 * Função para validar formato básico de URN
 */
function isValidUrn(urn: string): boolean {
  try {
    if (!urn || typeof urn !== "string") return false;

    // Verificar se é base64
    const decoded = Buffer.from(urn, "base64").toString("utf8");

    // Verificar se contém estrutura básica de URN do Forge
    return (
      decoded.includes("urn:adsk.objects:os.object:") ||
      decoded.includes("urn:adsk.viewing:") ||
      decoded.includes("urn:")
    );
  } catch {
    return false;
  }
}

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

// POST /api/models/upload-urn - Adicionar URN manual
router.post("/upload-urn", async (req: Request, res: Response) => {
  try {
    const { name, fileName, urn, description, metadata } = req.body;

    // Validações básicas
    if (!name || !urn) {
      return res.status(400).json({
        success: false,
        error: "Nome e URN são obrigatórios",
        required: ["name", "urn"],
      });
    }

    // Validar formato básico da URN (deve ser base64)
    if (!isValidUrn(urn)) {
      return res.status(400).json({
        success: false,
        error: "Formato de URN inválido. Deve ser uma string base64 válida.",
        example: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6...",
      });
    }

    // Verificar se URN já existe
    const existingModel = await Model.findOne({ urn });
    if (existingModel) {
      return res.status(409).json({
        success: false,
        error: "URN já existe no sistema",
        existingModel: {
          id: existingModel._id,
          name: existingModel.name,
          uploadDate: existingModel.uploadDate,
        },
      });
    }

    // Criar novo modelo personalizado
    const newModel = new Model({
      name: name.trim(),
      fileName: fileName?.trim(),
      urn: urn.trim(),
      base64Urn: urn.trim(),
      description: description?.trim(),
      status: "success", // URN já validada e pronta
      progress: "complete",
      fileType: "manual",
      fileSize: 0, // URN manual não tem arquivo físico
      tags: ["manual", "upload-urn"],
      metadata: {
        processingMethod: "manual-urn",
        uploadedAt: new Date(),
        ...metadata,
      },
    });

    await newModel.save();

    console.log(`📥 Nova URN adicionada: ${name} (${urn.substring(0, 20)}...)`);

    res.status(201).json({
      success: true,
      message: "URN adicionada com sucesso",
      model: {
        id: newModel._id,
        name: newModel.name,
        fileName: newModel.fileName,
        urn: newModel.urn,
        description: newModel.description,
        status: newModel.status,
        uploadDate: newModel.uploadDate,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao adicionar URN:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor ao processar URN",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});

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
