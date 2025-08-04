// Carregar variáveis de ambiente PRIMEIRO
import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import db from "./models";
import doorRoutes from "./routes/doorRoutes";
import modelRoutes from "./routes/modelRoutes";
import modelsRoutes from "./routes/modelsRoutes";
import ifcUploadRoutes from "./routes/ifcUploadRoutes";
import forgeAuthService from "./services/forgeAuthService";

const app = express();

// URN padrão válida para teste (modelo que sabemos que funciona)
// Default URN for testing when no valid URN is available - Real URN from Autodesk extension
const DEFAULT_TEST_URN =
  "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw";

// Função para obter URN válida (remove fake, usa padrão se necessário)
function getValidUrn(urn?: string): string {
  // Se não tem URN, usa a padrão
  if (!urn) {
    console.log("🔄 URN não fornecida, usando URN padrão de teste");
    return DEFAULT_TEST_URN;
  }

  try {
    // Decodifica para verificar se é fake
    const decoded = Buffer.from(urn, "base64").toString();

    // Se contém "forge-viewer-models/" mas NÃO termina com .IFC/.ifc, é provável fake
    if (
      decoded.includes("forge-viewer-models/") &&
      !decoded.match(/\.(ifc|IFC)$/)
    ) {
      console.log(
        "🔄 URN fake detectada (sem extensão IFC válida), usando URN padrão de teste"
      );
      return DEFAULT_TEST_URN;
    }

    // Se é a URN padrão que definimos, é válida
    if (urn === DEFAULT_TEST_URN) {
      console.log("✅ URN padrão válida detectada");
      return urn;
    }

    // Se chegou até aqui, considera válida
    console.log("✅ URN válida detectada");
    return urn;
  } catch {
    // Se não conseguir decodificar, usa padrão
    console.log("🔄 URN inválida, usando URN padrão de teste");
    return DEFAULT_TEST_URN;
  }
}

// Configurações de CORS
const corsOptions = {
  origin: "*",
};

// Middlewares
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`��� ${req.method} ${req.path}`);
  next();
});

// Configuração do banco de dados
const useCloud = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 8080;

// Conectar ao MongoDB com error handling robusto
db.mongoose
  .connect(useCloud ? db.cloudUrl : db.localUrl)
  .then(() => {
    console.log("✅ Conectado ao banco de dados!");
  })
  .catch((err: any) => {
    console.log("❌ Não foi possível conectar ao banco de dados!", err.message);
    console.log("🔧 Continuando em modo desenvolvimento...");
    // Não sair do processo em desenvolvimento para permitir debugging
    if (process.env.NODE_ENV === "production") {
      process.exit();
    }
  });

// Registrar modelos
require("./models/doorModel");

// Registrar rotas
doorRoutes(app);
modelRoutes(app);

// Endpoint de teste
app.get("/api/test", (req: Request, res: Response) => {
  res.json({ message: "Teste funcionando!", timestamp: new Date() });
});

/**
 * Endpoint para obter URN válida para visualização
 * Remove URNs fake e retorna sempre uma URN válida
 * DEVE estar ANTES de app.use("/api/models", modelsRoutes)
 */
app.get("/api/viewer-urn/:id", async (req: Request, res: Response) => {
  console.log("🎯 Endpoint viewer-urn chamado!");
  try {
    const { id } = req.params;
    const Model = require("./models/Model").default;
    const model = await Model.findById(id);

    if (!model) {
      return res.status(404).json({ error: "Modelo não encontrado" });
    }

    // Sempre retorna URN válida (remove fakes, usa padrão se necessário)
    const validUrn = getValidUrn(model.base64Urn);

    console.log(`🎯 Modelo: ${model.name}`);
    console.log(`✅ URN válida: ${validUrn.substring(0, 50)}...`);

    res.json({
      success: true,
      data: {
        id: model._id,
        name: model.name,
        fileName: model.fileName,
        urn: validUrn, // Sempre válida
        status: model.status,
      },
    });
  } catch (error) {
    console.error("Erro ao obter URN válida:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rotas REST para múltiplos modelos
app.use("/api/models", modelsRoutes);

// Rotas para upload e processamento IFC
app.use("/api/ifc", ifcUploadRoutes);

/**
 * Endpoint para obter token do Forge
 * Baseado exatamente no repositório original
 */
app.get("/token", async (req: Request, res: Response) => {
  try {
    const token = await forgeAuthService.getAccessToken();
    res.json(token);
  } catch (error) {
    console.error("Erro ao obter token:", error);
    res.status(500).json({ error: "Falha na autenticação" });
  }
});

// Configuração para produção
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../client", "build", "index.html"));
  });
}

// Rota raiz
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "🚀 Forge API Server - URN Generation & Model Management",
    version: "1.0.0",
    endpoints: {
      token: "/token",
      doors: "/api/doors",
    },
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

export default app;
