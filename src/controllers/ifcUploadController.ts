import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { APSOfficialService } from "../services/apsOfficialService";

const apsOfficialService = new APSOfficialService();
import Model from "../models/Model";

/**
 * Controller para upload e processamento automático de arquivos IFC
 */
class IFCUploadController {
  /**
   * Configuração do multer para upload de arquivos
   */
  private upload = multer({
    dest: "uploads/temp/", // Pasta temporária
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB max
    },
    fileFilter: (req, file, cb) => {
      // Aceitar apenas arquivos .ifc
      const allowedExtensions = [".ifc", ".IFC"];
      const fileExtension = path.extname(file.originalname);

      if (allowedExtensions.includes(fileExtension)) {
        cb(null, true);
      } else {
        cb(new Error("Apenas arquivos .ifc são permitidos"));
      }
    },
  });

  /**
   * Middleware do multer para upload único
   */
  uploadMiddleware = this.upload.single("ifcFile");

  /**
   * POST /api/models/upload-ifc
   * Upload e processamento automático de arquivo IFC
   */
  uploadAndProcessIFC = async (req: Request, res: Response) => {
    console.log("🚀 IFC Upload: Iniciando processamento...");
    console.log("📁 Arquivo recebido:", req.file?.originalname);
    console.log("📋 Dados recebidos:", req.body);

    const tempFilePath = req.file?.path;

    try {
      // Validação do arquivo
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Nenhum arquivo enviado",
          required: "Arquivo .ifc é obrigatório",
        });
      }

      const { originalname, size } = req.file;
      const { name, description } = req.body;

      console.log(
        `📁 Arquivo recebido: ${originalname} (${Math.round(size / 1024)}KB)`
      );

      // Validação dos campos obrigatórios
      if (!name) {
        return res.status(400).json({
          success: false,
          error: "Nome é obrigatório",
          received: { name, description, fileName: originalname },
        });
      }

      // Verificar se já existe modelo com este nome
      const existingModel = await Model.findOne({ name: name.trim() });
      if (existingModel) {
        return res.status(409).json({
          success: false,
          error: "Já existe um modelo com este nome",
          existingModel: {
            id: existingModel._id,
            name: existingModel.name,
            status: existingModel.status,
          },
        });
      }

      // Processar arquivo IFC usando APS (Autodesk Platform Services) API real
      console.log(
        `🚀 Iniciando processamento via APS SDK oficial: ${originalname}`
      );

      // Ler arquivo para buffer
      const fileBuffer = fs.readFileSync(tempFilePath!);
      const bucketKey = `forge-real-${Date.now()}`;

      const processingResult = await apsOfficialService.processFile(
        tempFilePath!,
        originalname
      );

      if (!processingResult.success) {
        return res.status(500).json({
          success: false,
          error: "Erro no processamento via APS SDK oficial",
          details: processingResult.message,
        });
      }

      // Salvar modelo no banco de dados
      const newModel = new Model({
        name: name.trim(),
        fileName: originalname,
        urn: processingResult.urn,
        base64Urn: processingResult.urn,
        status: "translating",
        progress: "0%",
        fileSize: size,
        fileType: "ifc",
        description:
          description?.trim() || `Modelo IFC processado automaticamente`,
        tags: ["ifc", "upload-automatico"],
        metadata: {
          ifcTypes: [],
          hasProperties: false,
          objectId: processingResult.objectId,
          processingMethod: "automatic-upload",
          uploadedAt: new Date(),
        },
      });

      await newModel.save();

      console.log(`✅ Modelo salvo no banco: ${newModel._id}`);

      // Resposta de sucesso
      res.status(201).json({
        success: true,
        message: "Arquivo IFC enviado e processamento iniciado com sucesso",
        model: {
          id: newModel._id,
          name: newModel.name,
          fileName: newModel.fileName,
          urn: newModel.urn,
          status: newModel.status,
          progress: newModel.progress,
          fileSize: newModel.fileSize,
          description: newModel.description,
          uploadedAt: newModel.uploadDate,
        },
        processing: {
          objectId: processingResult.objectId,
          estimatedTime: "2-5 minutos",
        },
        nextSteps: {
          checkStatus: `/api/models/${newModel._id}/status`,
          viewModel: `/api/models/${newModel._id}`,
        },
      });

      // Monitorar progresso em background
      this.monitorTranslationProgress(
        String(newModel._id),
        processingResult.urn!
      );
    } catch (error) {
      console.error("❌ Erro no upload IFC:", error);

      res.status(500).json({
        success: false,
        error: "Erro interno no processamento do arquivo",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      });
    } finally {
      // Limpar arquivo temporário
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log(`🗑️ Arquivo temporário removido: ${tempFilePath}`);
      }
    }
  };

  /**
   * Monitorar progresso da tradução em background
   */
  private async monitorTranslationProgress(modelId: string, urn: string) {
    console.log(`👀 Monitorando progresso da tradução: ${modelId}`);

    const maxAttempts = 30; // 15 minutos (30 x 30s)
    let attempts = 0;

    const checkProgress = async () => {
      try {
        attempts++;

        const status = await apsOfficialService.getTranslationStatus(urn);
        console.log(
          `📊 Status da tradução ${modelId} via SDK: ${status.status} (${
            status.progress || "N/A"
          })`
        );

        // Atualizar modelo no banco
        await Model.findByIdAndUpdate(modelId, {
          status: this.mapForgeStatusToModelStatus(status.status),
          progress: status.progress || "0%",
          "metadata.hasProperties": status.status === "success",
        });

        if (status.status === "success") {
          console.log(`✅ Tradução concluída com sucesso: ${modelId}`);
          return;
        }

        if (status.status === "failed" || attempts >= maxAttempts) {
          console.log(`❌ Tradução falhou ou timeout: ${modelId}`);
          await Model.findByIdAndUpdate(modelId, {
            status: "failed",
            progress: status.progress || "0%",
          });
          return;
        }

        // Continuar monitoramento
        setTimeout(checkProgress, 30000); // 30 segundos
      } catch (error) {
        console.error(`❌ Erro no monitoramento ${modelId}:`, error);
      }
    };

    // Iniciar monitoramento após 10 segundos
    setTimeout(checkProgress, 10000);
  }

  /**
   * Mapear status do Forge para status do modelo
   */
  private mapForgeStatusToModelStatus(forgeStatus: string): string {
    switch (forgeStatus) {
      case "success":
        return "success";
      case "inprogress":
        return "translating";
      case "failed":
        return "failed";
      case "timeout":
        return "failed";
      default:
        return "translating";
    }
  }

  /**
   * GET /api/models/upload-ifc/status/:id
   * Verificar status específico do upload
   */
  getUploadStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const model = await Model.findById(id);

      if (!model) {
        return res.status(404).json({
          success: false,
          error: "Modelo não encontrado",
        });
      }

      // Se modelo tem URN, verificar status no Forge
      let forgeStatus = null;
      if (model.urn && model.status === "translating") {
        forgeStatus = await apsOfficialService.getTranslationStatus(model.urn);

        // Atualizar status se necessário
        if (
          forgeStatus.status === "success" &&
          model.status === "translating"
        ) {
          model.status = "success" as any;
          model.progress = "100%";
          if (model.metadata) {
            model.metadata.hasProperties = true;
          }
          await model.save();
        }
      }

      res.json({
        success: true,
        model: {
          id: model._id,
          name: model.name,
          fileName: model.fileName,
          status: model.status,
          progress: model.progress,
          fileSize: model.fileSize,
          uploadedAt: model.uploadDate,
          canVisualize: model.status === "success",
        },
        forge: forgeStatus
          ? {
              status: forgeStatus.status,
              progress: forgeStatus.progress,
              lastCheck: new Date().toISOString(),
            }
          : null,
      });
    } catch (error) {
      console.error("❌ Erro ao verificar status:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao verificar status do upload",
      });
    }
  };
}

export default new IFCUploadController();
