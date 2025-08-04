import { Request, Response } from "express";
import Model, { IModel } from "../models/Model";
import modelDerivativeService from "../services/modelDerivativeService";
import modelPropertiesService from "../services/modelPropertiesService";

export class ModelsController {
  // Listar todos os modelos (UNIFICADO: Model + CustomModel)
  async getAllModels(req: Request, res: Response) {
    try {
      const { status, tag, search } = req.query;
      let filter: any = {};

      // Filtros opcionais
      if (status) filter.status = status;
      if (tag) filter.tags = { $in: [tag] };
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { fileName: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      // Buscar em ambas as coleções
      const regularModels = await Model.find(filter).sort({ uploadDate: -1 });

      const CustomModel = require("../models/customModelModel").default;
      const customModels = await CustomModel.find(filter).sort({
        uploadedAt: -1,
      });

      // Unificar os modelos em uma única lista
      const allModels = [
        ...regularModels.map((model: any) => ({
          ...model.toObject(),
          source: "regular",
          uploadDate: model.uploadDate || model.updatedAt,
        })),
        ...customModels.map((model: any) => ({
          ...model.toObject(),
          source: "custom",
          uploadDate: model.uploadedAt || model.updatedAt,
        })),
      ];

      // Ordenar por data de upload (mais recente primeiro)
      allModels.sort(
        (a: any, b: any) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );

      console.log(
        `📋 Listando TODOS os modelos: ${allModels.length} encontrados`
      );
      console.log(
        `   Regular: ${regularModels.length}, Custom: ${customModels.length}`
      );

      res.json({
        success: true,
        count: allModels.length,
        data: allModels,
        summary: {
          regular: regularModels.length,
          custom: customModels.length,
          total: allModels.length,
        },
      });
    } catch (error) {
      console.error("Erro ao listar modelos:", error);
      res.status(500).json({
        error: "Erro ao listar modelos",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // Obter modelo específico
  async getModel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const model = await Model.findById(id);

      if (!model) {
        return res.status(404).json({
          error: "Modelo não encontrado",
        });
      }

      res.json({
        success: true,
        data: model,
      });
    } catch (error) {
      console.error("Erro ao obter modelo:", error);
      res.status(500).json({
        error: "Erro ao obter modelo",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // Registrar novo modelo (após upload via VS Code Extension ou API)
  async registerModel(req: Request, res: Response) {
    try {
      const { name, fileName, urn, fileSize, fileType, description, tags } =
        req.body;

      // Validação básica
      if (!name || !fileName || !urn || !fileSize || !fileType) {
        return res.status(400).json({
          error: "Campos obrigatórios: name, fileName, urn, fileSize, fileType",
        });
      }

      // Verificar se URN já existe
      const existingModel = await Model.findOne({ urn });
      if (existingModel) {
        return res.status(409).json({
          error: "Modelo com este URN já existe",
          existingId: existingModel._id,
        });
      }

      // Converter URN para base64 se necessário
      let base64Urn: string;
      try {
        // Se já está em base64, usar como está
        if (urn.includes("=") && !urn.includes(":")) {
          base64Urn = urn;
        } else {
          // Converter para base64
          base64Urn = Buffer.from(urn).toString("base64");
        }
      } catch (error) {
        return res.status(400).json({
          error: "URN inválido",
        });
      }

      const newModel = new Model({
        name,
        fileName,
        urn,
        base64Urn,
        fileSize,
        fileType: fileType.toLowerCase(),
        description,
        tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
      });

      await newModel.save();

      // Iniciar tradução em background (opcional - pode falhar sem afetar o registro)
      try {
        await modelDerivativeService.translateModel(urn);
        console.log(
          `Tradução iniciada para modelo ${(newModel._id as any).toString()}`
        );
      } catch (translationError) {
        console.log(
          `Aviso: Falha ao iniciar tradução para modelo ${(
            newModel._id as any
          ).toString()}`,
          translationError
        );
        // Não falhar o registro por causa da tradução
      }

      res.status(201).json({
        success: true,
        message: "Modelo registrado com sucesso",
        data: newModel,
      });
    } catch (error) {
      console.error("Erro ao registrar modelo:", error);
      res.status(500).json({
        error: "Erro ao registrar modelo",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // Atualizar modelo
  async updateModel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Campos que não podem ser atualizados
      delete updates.urn;
      delete updates.base64Urn;
      delete updates._id;
      delete updates.uploadDate;

      const model = await Model.findByIdAndUpdate(id, updates, { new: true });

      if (!model) {
        return res.status(404).json({
          error: "Modelo não encontrado",
        });
      }

      res.json({
        success: true,
        data: model,
      });
    } catch (error) {
      console.error("Erro ao atualizar modelo:", error);
      res.status(500).json({
        error: "Erro ao atualizar modelo",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // Deletar modelo
  async deleteModel(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Validar se o ID é um ObjectId válido do MongoDB
      const mongoose = require("mongoose");
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: "ID inválido",
          message: "O ID fornecido não é um ObjectId válido do MongoDB",
        });
      }

      // Primeiro tentar deletar da coleção principal (Model)
      let model = await Model.findByIdAndDelete(id);

      // Se não encontrou, tentar na coleção de modelos personalizados
      if (!model) {
        const CustomModel = require("../models/customModelModel").default;
        model = await CustomModel.findByIdAndDelete(id);
      }

      if (!model) {
        return res.status(404).json({
          success: false,
          error: "Modelo não encontrado",
          message: `Nenhum modelo encontrado com o ID: ${id}`,
        });
      }

      console.log(`🗑️ Modelo removido: ${model.name || model.fileName}`);

      res.json({
        success: true,
        message: "Modelo deletado com sucesso",
        deletedModel: {
          id: model._id,
          name: model.name,
          fileName: model.fileName,
          urn: model.urn,
        },
      });
    } catch (error) {
      console.error("❌ Erro ao deletar modelo:", error);
      res.status(500).json({
        success: false,
        error: "Erro ao deletar modelo",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // Status de tradução de modelo específico
  async getModelStatus(req: Request, res: Response) {
    console.log("��� INICIANDO getModelStatus para ID:", req.params.id);
    try {
      const { id } = req.params;
      const model = await Model.findById(id);

      if (!model) {
        return res.status(404).json({
          error: "Modelo não encontrado",
        });
      }

      try {
        // Usar o novo método detalhado de status (usando base64Urn)
        const statusInfo = await modelDerivativeService.getDetailedStatus(
          model.base64Urn
        );

        // Atualizar modelo no banco com status real
        let hasChanges = false;

        if (statusInfo.mappedStatus !== model.status) {
          model.status = statusInfo.mappedStatus;
          hasChanges = true;
        }

        if (statusInfo.mappedProgress !== model.progress) {
          model.progress = statusInfo.mappedProgress;
          hasChanges = true;
        }

        if (statusInfo.hasDerivatives && !model.metadata.hasProperties) {
          model.metadata.hasProperties = statusInfo.hasDerivatives;
          hasChanges = true;
        }

        // Salvar mudanças se houver
        if (hasChanges) {
          await model.save();
          console.log(
            `✅ Status atualizado para modelo ${model.name}: ${model.status} (${model.progress})`
          );
        }

        res.json({
          success: true,
          data: {
            id: model._id,
            name: model.name,
            fileName: model.fileName,
            status: model.status,
            progress: model.progress,
            canVisualize: statusInfo.canVisualize,
            hasDerivatives: statusInfo.hasDerivatives,
            lastChecked: new Date().toISOString(),
            forgeManifest: statusInfo.forgeStatus,
          },
        });
      } catch (forgeError) {
        console.warn(
          `⚠️  Erro ao verificar status no Forge para modelo ${model.name}:`,
          forgeError
        );

        // Retornar status do banco se houver erro no Forge
        res.json({
          success: true,
          data: {
            id: model._id,
            name: model.name,
            fileName: model.fileName,
            status: model.status,
            progress: model.progress,
            canVisualize: model.status === "success",
            hasDerivatives: model.metadata.hasProperties || false,
            lastChecked: new Date().toISOString(),
            error: "Erro ao verificar status no Forge - usando dados locais",
          },
        });
      }
    } catch (error) {
      console.error("Erro ao obter status:", error);
      res.status(500).json({
        error: "Erro ao obter status do modelo",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // Sincronizar status de todos os modelos com Forge
  async syncAllModels(req: Request, res: Response) {
    try {
      const models = await Model.find({});
      const results = [];
      let syncedCount = 0;
      let errorCount = 0;

      console.log(`🔄 Iniciando sincronização de ${models.length} modelos...`);

      for (const model of models) {
        try {
          const statusInfo = await modelDerivativeService.getDetailedStatus(
            model.base64Urn
          );

          let hasChanges = false;
          const oldStatus = model.status;
          const oldProgress = model.progress;

          if (statusInfo.mappedStatus !== model.status) {
            model.status = statusInfo.mappedStatus;
            hasChanges = true;
          }

          if (statusInfo.mappedProgress !== model.progress) {
            model.progress = statusInfo.mappedProgress;
            hasChanges = true;
          }

          if (statusInfo.hasDerivatives && !model.metadata.hasProperties) {
            model.metadata.hasProperties = statusInfo.hasDerivatives;
            hasChanges = true;
          }

          if (hasChanges) {
            await model.save();
            syncedCount++;
            console.log(
              `✅ ${model.name}: ${oldStatus}→${model.status} (${oldProgress}→${model.progress})`
            );
          }

          results.push({
            id: model._id,
            name: model.name,
            fileName: model.fileName,
            oldStatus,
            newStatus: model.status,
            oldProgress,
            newProgress: model.progress,
            canVisualize: statusInfo.canVisualize,
            updated: hasChanges,
          });
        } catch (modelError) {
          console.warn(
            `⚠️  Erro ao sincronizar modelo ${model.name}:`,
            modelError
          );
          errorCount++;

          results.push({
            id: model._id,
            name: model.name,
            fileName: model.fileName,
            error: "Erro na sincronização",
            updated: false,
          });
        }
      }

      console.log(
        `🎯 Sincronização concluída: ${syncedCount} atualizados, ${errorCount} erros`
      );

      res.json({
        success: true,
        message: `Sincronização concluída`,
        summary: {
          totalModels: models.length,
          syncedModels: syncedCount,
          errorsCount: errorCount,
          lastSync: new Date().toISOString(),
        },
        results,
      });
    } catch (error) {
      console.error("Erro na sincronização em massa:", error);
      res.status(500).json({
        error: "Erro na sincronização em massa",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // Propriedades de modelo específico
  async getModelProperties(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const model = await Model.findById(id);

      if (!model) {
        return res.status(404).json({
          error: "Modelo não encontrado",
        });
      }

      if (model.status !== "success") {
        return res.status(400).json({
          error: "Modelo ainda não processado completamente",
          status: model.status,
          progress: model.progress,
        });
      }

      try {
        const properties = await modelPropertiesService.getModelProperties(
          model.urn
        );

        res.json({
          success: true,
          modelId: model._id,
          modelName: model.name,
          fileName: model.fileName,
          data: properties,
        });
      } catch (propertiesError) {
        res.status(500).json({
          error: "Erro ao obter propriedades do modelo",
          message:
            "O modelo foi processado mas as propriedades não estão disponíveis",
        });
      }
    } catch (error) {
      console.error("Erro ao obter propriedades:", error);
      res.status(500).json({
        error: "Erro ao obter propriedades do modelo",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }

  // Estatísticas dos modelos
  async getStats(req: Request, res: Response) {
    try {
      const stats = await Model.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalSize: { $sum: "$fileSize" },
          },
        },
      ]);

      const totalModels = await Model.countDocuments();
      const totalSize = await Model.aggregate([
        { $group: { _id: null, total: { $sum: "$fileSize" } } },
      ]);

      res.json({
        success: true,
        data: {
          totalModels,
          totalSize: totalSize[0]?.total || 0,
          byStatus: stats,
        },
      });
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      res.status(500).json({
        error: "Erro ao obter estatísticas",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
}

export const modelsController = new ModelsController();
