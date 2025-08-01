// Carregar variáveis de ambiente PRIMEIRO
import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response } from "express";
import cors from "cors";
import db from "./models";
import doorRoutes from "./routes/doorRoutes";
import customModelRoutes from "./routes/customModelRoutes";
import forgeAuthService from "./services/forgeAuthService";

const app = express();

// URN do modelo principal (extraída do manifest real do Autodesk)
const MODEL_URN = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw';

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
    message: "🚀 Forge API - Model Viewer",
    version: "1.0.0",
    model: {
      name: "Edifício BR6-CSFAIP",
      fileName: "BR6-CSFAIP.IFC",
      status: "ready"
    },
    endpoints: {
      token: "/token",
      model: "/api/model/urn",
      doors: "/api/doors",
      customModels: "/api/models"
    }
  });
});

/**
 * 2. TOKEN AUTODESK FORGE
 * Baseado exatamente no repositório original
 */
app.get("/token", async (req: Request, res: Response) => {
  try {
    const token = await forgeAuthService.getAccessToken();
    console.log("✅ Token gerado com sucesso");
    res.json(token);
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
      description: "Modelo principal extraído do manifest do Autodesk"
    }
  });
});

/**
 * 4. PROPRIEDADES DO MODELO
 * Análise básica do modelo IFC
 */
app.get("/api/model/:urn/properties", async (req: Request, res: Response) => {
  try {
    const { urn } = req.params;
    console.log(`🔍 Obtendo propriedades do modelo: ${urn.substring(0, 20)}...`);
    
    // Simulação de propriedades IFC básicas
    res.json({
      success: true,
      model: {
        urn: urn,
        name: "BR6-CSFAIP.IFC",
        properties: {
          fileType: "IFC",
          elements: {
            doors: 0, // Será atualizado quando implementado
            walls: 0,
            windows: 0,
            total: 0
          },
          metadata: {
            created: "2025-07-31",
            software: "Autodesk Revit",
            version: "2024"
          }
        }
      }
    });
  } catch (error) {
    console.error("❌ Erro ao obter propriedades:", error);
    res.status(500).json({ error: "Erro ao obter propriedades do modelo" });
  }
});

/**
 * 5. SISTEMA DE PORTAS
 * Baseado exatamente no repositório original MERN-Stack-Revit-Forge-Viewer
 */
app.use("/api/doors", doorRoutes);

/**
 * 6. SISTEMA DE MODELOS PERSONALIZADOS ⭐ NOVO
 * Gerenciamento de URNs personalizadas via POST
 */
app.use("/api/models", customModelRoutes);

// Configuração para produção
if (process.env.NODE_ENV === "production") {
  app.use(express.static(__dirname + "/../client/build"));
  
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(__dirname + "/../client/build/index.html");
  });
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log("\n🚀 ===== FORGE API SIMPLIFICADA =====");
  console.log(`📍 Servidor: http://localhost:${PORT}`);
  console.log(`🎯 Modelo: BR6-CSFAIP.IFC`);
  console.log(`🔥 Status: Funcional e Otimizada`);
  console.log("\n📋 Endpoints Disponíveis:");
  console.log(`   GET  /                    - Status da API`);
  console.log(`   GET  /token               - Token Autodesk Forge`);
  console.log(`   GET  /api/model/urn       - URN do modelo principal ⭐`);
  console.log(`   GET  /api/model/:urn/properties - Propriedades IFC`);
  console.log(`   *    /api/doors/*         - Sistema de portas (CRUD)`);
  console.log(`   POST /api/models/upload-urn - Adicionar URN personalizada 🆕`);
  console.log(`   GET  /api/models/custom   - Listar modelos personalizados`);
  console.log("=====================================\n");
});

export default app;
