import { Router, Request, Response } from "express";
import CustomModel, { ICustomModel } from "../models/customModelModel";
import { v4 as uuidv4 } from "uuid";

const router = Router();

/**
 * POST /api/models/upload-urn
 * Adiciona uma nova URN de modelo personalizada
 */
router.post("/upload-urn", async (req: Request, res: Response) => {
  try {
    const { name, fileName, urn, description, metadata } = req.body;

    // Validações básicas
    if (!name || !urn) {
      return res.status(400).json({
        success: false,
        error: "Nome e URN são obrigatórios",
        required: ["name", "urn"]
      });
    }

    // Validar formato básico da URN (deve ser base64)
    if (!isValidUrn(urn)) {
      return res.status(400).json({
        success: false,
        error: "Formato de URN inválido. Deve ser uma string base64 válida.",
        example: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6..."
      });
    }

    // Verificar se URN já existe
    const existingModel = await CustomModel.findOne({ urn });
    if (existingModel) {
      return res.status(409).json({
        success: false,
        error: "URN já existe no sistema",
        existingModel: {
          id: existingModel._id,
          name: existingModel.name,
          uploadedAt: existingModel.uploadedAt
        }
      });
    }

    // Criar novo modelo personalizado
    const modelId = uuidv4();
    const newModel = new CustomModel({
      _id: modelId,
      name: name.trim(),
      fileName: fileName?.trim(),
      urn: urn.trim(),
      description: description?.trim(),
      status: "processing", // Começa como processing
      metadata: metadata || {}
    });

    await newModel.save();

    // Simular processamento (em produção seria real)
    setTimeout(async () => {
      try {
        await CustomModel.findByIdAndUpdate(modelId, { 
          status: "ready",
          "metadata.elements.total": Math.floor(Math.random() * 100) + 10
        });
        console.log(`✅ Modelo ${name} processado com sucesso`);
      } catch (error) {
        console.error(`❌ Erro no processamento do modelo ${name}:`, error);
      }
    }, 2000);

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
        uploadedAt: newModel.uploadedAt
      }
    });

  } catch (error) {
    console.error("❌ Erro ao adicionar URN:", error);
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor ao processar URN",
      details: process.env.NODE_ENV === "development" ? error : undefined
    });
  }
});

/**
 * GET /api/models/custom
 * Lista todos os modelos personalizados
 */
router.get("/custom", async (req: Request, res: Response) => {
  try {
    const models = await CustomModel.find()
      .sort({ uploadedAt: -1 })
      .select("-__v");

    res.json({
      success: true,
      count: models.length,
      models: models
    });

  } catch (error) {
    console.error("❌ Erro ao listar modelos:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao listar modelos personalizados"
    });
  }
});

/**
 * GET /api/models/custom/:id
 * Obter modelo personalizado específico
 */
router.get("/custom/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const model = await CustomModel.findById(id);

    if (!model) {
      return res.status(404).json({
        success: false,
        error: "Modelo não encontrado"
      });
    }

    res.json({
      success: true,
      model: model
    });

  } catch (error) {
    console.error("❌ Erro ao obter modelo:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao obter modelo personalizado"
    });
  }
});

/**
 * DELETE /api/models/custom/:id
 * Remove modelo personalizado
 */
router.delete("/custom/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedModel = await CustomModel.findByIdAndDelete(id);

    if (!deletedModel) {
      return res.status(404).json({
        success: false,
        error: "Modelo não encontrado"
      });
    }

    console.log(`🗑️ Modelo removido: ${deletedModel.name}`);

    res.json({
      success: true,
      message: "Modelo removido com sucesso",
      deletedModel: {
        id: deletedModel._id,
        name: deletedModel.name,
        urn: deletedModel.urn
      }
    });

  } catch (error) {
    console.error("❌ Erro ao remover modelo:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao remover modelo personalizado"
    });
  }
});

/**
 * Validação básica de URN
 * Verifica se é uma string base64 válida
 */
function isValidUrn(urn: string): boolean {
  if (!urn || typeof urn !== "string") return false;
  
  // Deve ter pelo menos 10 caracteres
  if (urn.length < 10) return false;
  
  // Regex para base64 básico
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  return base64Regex.test(urn);
}

export default router;
