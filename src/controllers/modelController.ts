import { Request, Response } from "express";
import modelPropertiesService from "../services/modelPropertiesService";
import modelDerivativeService from "../services/modelDerivativeService";

/**
 * Controller para gerenciar URNs de modelos e propriedades
 */
class ModelController {
  /**
   * Obter URN do modelo para visualização
   */
  getModelUrn = async (req: Request, res: Response): Promise<Response> => {
    try {
      const modelUrn =
        process.env.MODEL_URN ||
        "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aGFjazIyL3Rlc3QucnZ0";

      return res.json({
        urn: modelUrn,
        message: "URN do modelo obtido com sucesso",
        status: "ready",
      });
    } catch (error) {
      console.error("❌ Erro ao obter URN:", error);
      return res.status(500).json({
        error: "Erro ao obter URN do modelo",
      });
    }
  };

  /**
   * Iniciar tradução de modelo para viewables
   */
  translateModel = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { urn } = req.body;

      if (!urn) {
        return res.status(400).json({
          error: "URN do modelo é obrigatório",
        });
      }

      console.log("🔄 Iniciando tradução do modelo:", urn);

      const result = await modelDerivativeService.translateModel(urn);

      return res.json({
        message: "Tradução iniciada com sucesso",
        urn: urn,
        result: result,
      });
    } catch (error: any) {
      console.error("❌ Erro ao iniciar tradução:", error.message);
      return res.status(500).json({
        error: "Erro ao iniciar tradução do modelo",
        message: error.message,
      });
    }
  };

  /**
   * Verificar status da tradução
   */
  getTranslationStatus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { urn } = req.params;

      if (!urn) {
        return res.status(400).json({
          error: "URN do modelo é obrigatório",
        });
      }

      console.log("🔍 Verificando status da tradução:", urn);

      const status = await modelDerivativeService.getTranslationStatus(urn);

      return res.json({
        urn: urn,
        status: status,
      });
    } catch (error: any) {
      console.error("❌ Erro ao verificar status:", error.message);
      return res.status(500).json({
        error: "Erro ao verificar status da tradução",
        message: error.message,
      });
    }
  };

  /**
   * Listar modelos disponíveis
   */
  listModels = async (req: Request, res: Response): Promise<Response> => {
    try {
      const models = [
        {
          id: "model-001",
          name: "Projeto Principal",
          urn:
            process.env.MODEL_URN ||
            "urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aGFjazIyL3Rlc3QucnZ0",
          status: "ready",
          description: "Modelo principal do projeto",
        },
      ];

      return res.json({
        models,
        count: models.length,
      });
    } catch (error: any) {
      console.error("❌ Erro ao listar modelos:", error.message);
      return res.status(500).json({
        error: "Erro ao listar modelos",
      });
    }
  };

  /**
   * Obter todas as propriedades de um modelo
   */
  getModelProperties = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { urn } = req.params;

      if (!urn) {
        return res.status(400).json({
          error: "URN do modelo é obrigatório",
        });
      }

      console.log("🔍 Buscando propriedades para URN:", urn);

      const properties = await modelPropertiesService.getModelProperties(urn);

      return res.json(properties);
    } catch (error: any) {
      console.error("❌ Erro ao obter propriedades:", error.message);
      return res.status(500).json({
        error: "Erro ao obter propriedades do modelo",
        message: error.message,
      });
    }
  };

  /**
   * Análise completa do modelo IFC
   */
  analyzeIFCModel = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { urn } = req.params;

      if (!urn) {
        return res.status(400).json({
          error: "URN do modelo é obrigatório",
        });
      }

      console.log("🔍 Analisando modelo IFC:", urn);

      const allProperties = await modelPropertiesService.getModelProperties(
        urn
      );

      const analysis = {
        totalElements: allProperties.data.collection.length,
        categories: {} as { [key: string]: number },
      };

      allProperties.data.collection.forEach((obj) => {
        const type = obj.properties.Item?.Type || "Unknown";
        analysis.categories[type] = (analysis.categories[type] || 0) + 1;
      });

      return res.json({
        urn,
        analysis,
        fullData: allProperties,
      });
    } catch (error: any) {
      console.error("❌ Erro na análise do modelo IFC:", error.message);
      return res.status(500).json({
        error: "Erro na análise do modelo IFC",
        message: error.message,
      });
    }
  };
}

export default new ModelController();
