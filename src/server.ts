// Carregar variáveis de ambiente PRIMEIRO
import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import db from "./models";
import Model from "./models/Model";
import modelsRoutes from "./routes/modelsRoutes";
import ifcUploadRoutes from "./routes/ifcUploadRoutes";

const app = express();

// Interface para erros da API
interface ApiError extends Error {
  status?: number;
  code?: string;
}

// Middleware de tratamento de erros global
function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.status || 500;
  const message = err.message || "Erro interno do servidor";

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

// Configurações de CORS e Middlewares
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do banco de dados
const useCloud = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 8081;

// Conectar ao MongoDB com error handling robusto
db.mongoose
  .connect(useCloud ? db.cloudUrl : db.localUrl)
  .then(() => {
    console.log("✅ Conectado ao banco de dados!");
  })
  .catch((err: any) => {
    const errorMessage = `Falha na conexão com o banco de dados: ${err.message}`;
    if (process.env.NODE_ENV === "production") {
      throw new Error(errorMessage);
    } else {
      // Em desenvolvimento, apenas registra o erro mas continua executando
      console.error(errorMessage);
    }
  });

// Endpoint de teste
app.get("/api/test", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: "API funcionando",
      timestamp: new Date(),
    },
  });
});

// Endpoint de teste para verificar variáveis de ambiente
app.get("/api/debug-env", (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      hasClientId: !!process.env.FORGE_CLIENT_ID,
      hasClientSecret: !!process.env.FORGE_CLIENT_SECRET,
      clientIdLength: process.env.FORGE_CLIENT_ID?.length || 0,
      clientSecretLength: process.env.FORGE_CLIENT_SECRET?.length || 0,
      timestamp: new Date(),
    },
  });
});

// Endpoint de teste para verificar credenciais do Forge
app.get("/api/test-forge-credentials", async (req: Request, res: Response) => {
  try {
    const clientId = process.env.FORGE_CLIENT_ID;
    const clientSecret = process.env.FORGE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(400).json({
        success: false,
        error: "Credenciais não configuradas",
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
      });
    }

    // Testar apenas a validação das credenciais (sem fazer chamada real)
    res.json({
      success: true,
      message: "Credenciais configuradas corretamente",
      data: {
        clientId: `${clientId.substring(0, 10)}...`,
        clientSecret: `${clientSecret.substring(0, 10)}...`,
        clientIdLength: clientId.length,
        clientSecretLength: clientSecret.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Erro ao verificar credenciais",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Endpoint de token para Forge Viewer (ESSENCIAL para frontend)
app.get("/token", async (req: Request, res: Response) => {
  try {
    // Importar o APSOfficialService que está funcionando
    const { APSOfficialService } = await import(
      "./services/apsOfficialService"
    );
    const apsService = new APSOfficialService();

    const credentials = await apsService.getViewerToken();

    res.json({
      success: true,
      access_token: credentials.access_token,
      token_type: "Bearer",
      expires_in: credentials.expires_in,
    });
  } catch (error: any) {
    console.error("❌ Erro ao obter token:", error);
    res.status(500).json({
      success: false,
      error: "Falha ao obter token de acesso",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Endpoint para obter URN do modelo para o viewer (ESSENCIAL para frontend)
app.get("/api/viewer-urn/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID do modelo não fornecido",
      });
    }

    // Buscar modelo no banco
    const model = await Model.findById(id);

    if (!model) {
      return res.status(404).json({
        success: false,
        error: "Modelo não encontrado",
      });
    }

    if (!model.urn) {
      return res.status(400).json({
        success: false,
        error: "Modelo não possui URN válida",
        modelId: id,
        status: model.status,
      });
    }

    // Verificar se o modelo está traduzido e pronto para visualização
    if (model.status !== "success") {
      return res.status(400).json({
        success: false,
        error: "Modelo não está pronto para visualização",
        modelId: id,
        status: model.status,
        progress: model.progress,
      });
    }

    res.json({
      success: true,
      data: {
        modelId: id,
        urn: model.urn,
        name: model.name,
        fileName: model.fileName,
        status: model.status,
        canVisualize: true,
      },
    });
  } catch (error: any) {
    console.error("❌ Erro ao obter URN do viewer:", error);
    res.status(500).json({
      success: false,
      error: "Falha ao obter URN do modelo",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Usar rotas IFC
app.use("/api/models/ifc", ifcUploadRoutes);

// Rotas principais de modelos
app.use("/api/models", modelsRoutes);

// Registrar middleware de erro global
app.use(errorHandler);

/**
 * Documentação da API
 */
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    name: "Forge API Server - Simplificado",
    version: "2.0.0",
    description: "API simplificada com rota IFC funcional",
    endpoints: {
      status: "/api/test",
      token: "/token",
      viewer: "/api/viewer-urn/:id",
      models: {
        base: "/api/models",
        list: "/api/models",
        byId: "/api/models/:id",
        upload: "/api/models/upload-urn",
        ifc: {
          upload: "/api/models/ifc/upload",
          status: "/api/models/ifc/status/:id",
        },
      },
    },
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

export default app;
