// Carregar variáveis de ambiente PRIMEIRO
import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import db from "./models";
import doorRoutes from "./routes/doorRoutes";
import modelsRoutes from "./routes/modelsRoutes";
import ifcUploadRoutes from "./routes/ifcUploadRoutes";
import forgeSDKService from "./services/forgeSDKService";

const app = express();

// URNs de modelos validados no Autodesk Forge
const MODEL_URN =
  "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw";

// Segundo modelo validado (BR6-DC2B.IFC)
const MODEL_URN_DC2B =
  "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtREMyQi5JRkM";

// Middlewares básicos
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de log
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.path}`);
  next();
});

// Conectar ao MongoDB
const useCloud = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 8081;

db.mongoose
  .connect(useCloud ? db.cloudUrl : db.localUrl)
  .then(() => {
    console.log("✅ Conectado ao banco de dados!");
  })
  .catch((err: any) => {
    console.log("❌ Não foi possível conectar ao banco de dados!", err.message);
    console.log("🔧 Continuando em modo desenvolvimento...");
  });

// Registrar modelos
require("./models/doorModel");
require("./models/customModelModel");

/**
 * 1. STATUS DA API
 * Informações básicas sobre a API
 */
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "🚀 Forge API - Real Autodesk Platform Services",
    version: "2.0.0",
    status: "real", // Não mais simulado
    model: {
      name: "Edifício BR6-CSFAIP",
      fileName: "BR6-CSFAIP.IFC",
      status: "ready",
    },
    processing: {
      type: "autodesk-forge-sdk",
      realProcessing: true,
      mockData: false,
    },
    endpoints: {
      token: "/token",
      model: "/api/model/urn",
      doors: "/api/doors",
      models: "/api/models",
      upload: "/api/models/ifc/upload",
    },
  });
});

/**
 * 2. TOKEN AUTODESK FORGE (Via SDK Oficial)
 * Resolve problemas de "Legacy endpoint deprecated"
 */
app.get("/token", async (req: Request, res: Response) => {
  try {
    console.log("🔑 Obtendo token via SDK oficial do Autodesk Forge...");
    const token = await forgeSDKService.getAccessToken();
    console.log("✅ Token obtido com sucesso");
    res.json({ access_token: token, token_type: "Bearer" });
  } catch (error) {
    console.error("❌ Erro ao obter token:", error);
    res.status(500).json({ error: "Falha na autenticação" });
  }
});

/**
 * 3. MODELO PRINCIPAL ⭐
 * Retorna URN do modelo principal - baseado no repositório original
 */
app.get("/api/model/urn", (req: Request, res: Response) => {
  console.log("🎯 Fornecendo URN do modelo principal");

  res.json({
    success: true,
    model: {
      id: "br6-csfaip",
      name: "Edifício BR6-CSFAIP",
      fileName: "BR6-CSFAIP.IFC",
      urn: MODEL_URN,
      status: "ready",
      description: "Modelo principal extraído do manifest do Autodesk",
    },
  });
});

/**
 * 4. PROPRIEDADES DO MODELO
 * Análise real via Autodesk Forge API
 */
app.get("/api/model/:urn/properties", async (req: Request, res: Response) => {
  try {
    const { urn } = req.params;
    console.log(
      `🔍 Obtendo propriedades do modelo via Forge API: ${urn.substring(
        0,
        20
      )}...`
    );

    // Obter propriedades reais via Forge API
    const manifest = await forgeSDKService.getTranslationStatus(urn);

    res.json({
      success: true,
      model: {
        urn: urn,
        name: manifest.name || "Modelo IFC",
        status: manifest.status,
        progress: manifest.progress,
        manifest: manifest,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao obter propriedades:", error);
    res.status(500).json({
      success: false,
      error: "Erro ao obter propriedades do modelo",
      message: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

/**
 * 5. SISTEMA DE PORTAS
 * Baseado exatamente no repositório original MERN-Stack-Revit-Forge-Viewer
 */
app.use("/api/doors", doorRoutes);

/**
 * 6. UPLOAD E PROCESSAMENTO AUTOMÁTICO DE IFC 🚀
 * Upload direto de arquivos .ifc com processamento no Autodesk Forge
 * DEVE vir ANTES da rota genérica /api/models para evitar conflitos
 */
app.use("/api/models/ifc", ifcUploadRoutes);

/**
 * 8. ROTAS COMPLETAS DE MODELOS ⭐
 * GET, POST, PUT, DELETE para /api/models (incluindo DELETE /:id)
 * DEVE vir DEPOIS das rotas específicas
 */
app.use("/api/models", modelsRoutes);

/**
 * 8.1. COMPATIBILIDADE: POST /api/models/upload-urn ⭐
 * Redireciona para a lógica dos modelos personalizados
 * Mantém compatibilidade com frontend que espera esta rota
 */
app.post("/api/models/upload-urn", async (req: Request, res: Response) => {
  try {
    const { name, fileName, urn, description, fileSize, software, version } =
      req.body;

    // Validações básicas
    if (!name || !urn) {
      return res.status(400).json({
        success: false,
        error: "Nome e URN são obrigatórios",
        required: ["name", "urn"],
      });
    }

    // Usar a lógica do CustomModel
    const CustomModel = require("./models/customModelModel").default;
    const { v4: uuidv4 } = require("uuid");

    // Verificar se URN já existe
    const existingModel = await CustomModel.findOne({ urn });
    if (existingModel) {
      return res.status(409).json({
        success: false,
        error: "URN já existe no sistema",
        existingModel: {
          id: existingModel._id,
          name: existingModel.name,
          uploadedAt: existingModel.uploadedAt,
        },
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
      status: "ready", // URN já validada e pronta
      metadata: {
        fileSize: fileSize || 0,
        software: software || "Desconhecido",
        version: version || "Desconhecido",
      },
    });

    await newModel.save();

    console.log(
      `📥 Nova URN adicionada via /api/models/upload-urn: ${name} (${urn.substring(
        0,
        20
      )}...)`
    );

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
        uploadedAt: newModel.uploadedAt,
        metadata: newModel.metadata,
      },
    });
  } catch (error) {
    console.error(
      "❌ Erro ao adicionar URN via /api/models/upload-urn:",
      error
    );
    res.status(500).json({
      success: false,
      error: "Erro interno do servidor ao processar URN",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});

/**
 * 8.2. COMPATIBILIDADE: DELETE /api/models/custom/:id ⭐
 * Redireciona para a lógica dos modelos personalizados
 * Mantém compatibilidade com frontend que espera esta rota
 */
app.delete("/api/models/custom/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const CustomModel = require("./models/customModelModel").default;

    const deletedModel = await CustomModel.findByIdAndDelete(id);

    if (!deletedModel) {
      return res.status(404).json({
        success: false,
        error: "Modelo não encontrado",
      });
    }

    console.log(
      `🗑️ Modelo removido via /api/models/custom/:id: ${deletedModel.name}`
    );

    res.json({
      success: true,
      message: "Modelo removido com sucesso",
      deletedModel: {
        id: deletedModel._id,
        name: deletedModel.name,
        urn: deletedModel.urn,
      },
    });
  } catch (error) {
    console.error(
      "❌ Erro ao remover modelo via /api/models/custom/:id:",
      error
    );
    res.status(500).json({
      success: false,
      error: "Erro ao remover modelo personalizado",
    });
  }
});

/**
 * INFO: Upload de arquivos IFC
 */
app.get("/api/models/upload-info", (req: Request, res: Response) => {
  res.json({
    message:
      "Como fazer upload de arquivos IFC para processamento no Autodesk Forge",
    steps: [
      {
        step: 1,
        description: "Use o endpoint POST /api/models/ifc/upload",
        method: "POST",
        endpoint: "/api/models/ifc/upload",
        contentType: "multipart/form-data",
        field: "ifcFile",
      },
      {
        step: 2,
        description: "O arquivo será processado no Autodesk Forge",
        note: "Retornará URN válida após processamento completo",
      },
      {
        step: 3,
        description: "Use GET /api/models para ver modelos processados",
        endpoint: "/api/models",
      },
    ],
    currentStatus: {
      realModels: 2,
      description: "Modelos validados no Autodesk Forge",
      visualizable: [
        "Edifício BR6-CSFAIP (Padrão)",
        "BR6-DC2B.IFC (Verificado)",
      ],
    },
  });
});

/**
 * FUNÇÃO AUXILIAR: Processar arquivo IFC via Autodesk Forge REAL
 */
async function generateRealUrn(
  fileName: string,
  filePath?: string
): Promise<string> {
  try {
    console.log(`🚀 Processamento REAL via Autodesk Forge para: ${fileName}`);

    // Se temos o arquivo físico, processar no Autodesk Forge
    if (filePath && require("fs").existsSync(filePath)) {
      const fileBuffer = require("fs").readFileSync(filePath);
      const bucketKey = `forge-ifc-${Date.now()}`;

      const result = await forgeSDKService.processFile(
        bucketKey,
        fileName,
        fileBuffer
      );

      if (result.success && result.urn) {
        console.log(
          `✅ URN REAL obtida via Autodesk Forge: ${result.urn.substring(
            0,
            50
          )}...`
        );
        return result.urn;
      }
    }

    throw new Error(
      `Arquivo não encontrado ou erro no processamento: ${fileName}`
    );
  } catch (error) {
    console.error(`❌ Erro ao processar ${fileName} no Autodesk Forge:`, error);
    throw error;
  }
}

// Configuração para produção
if (process.env.NODE_ENV === "production") {
  app.use(express.static(__dirname + "/../client/build"));

  app.get("*", (req: Request, res: Response) => {
    res.sendFile(__dirname + "/../client/build/index.html");
  });
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log("\n🚀 ===== FORGE API REAL =====");
  console.log(`📍 Servidor: http://localhost:${PORT}`);
  console.log(`🎯 Processamento: Autodesk Forge SDK`);
  console.log(`🔥 Status: API Real - Sem Simulações`);
  console.log("\n📋 Endpoints Disponíveis:");
  console.log(`   GET  /                    - Status da API`);
  console.log(`   GET  /token               - Token Autodesk Forge Real`);
  console.log(`   GET  /api/model/urn       - URN do modelo principal ⭐`);
  console.log(
    `   GET  /api/model/:urn/properties - Propriedades via Forge API`
  );
  console.log(`   *    /api/doors/*         - Sistema de portas (CRUD)`);
  console.log(`   GET  /api/models          - Todos os modelos (UNIFICADO) 🆕`);
  console.log(`   GET  /api/models/:id      - Detalhes de modelo específico`);
  console.log(
    `   POST /api/models/upload-urn - Adicionar URN personalizada (UNIFICADO) 🆕`
  );
  console.log(`   POST /api/models/ifc/upload - Upload e processamento IFC 🚀`);
  console.log(`   GET  /api/models/ifc/status/:id - Status processamento IFC`);
  console.log(`   GET  /api/models/upload-info - Informações de upload`);
  console.log("=====================================\n");
});

export default app;
