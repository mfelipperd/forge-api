// Teste simples do ForgeAuthService
const path = require("path");
require("dotenv").config();

// Usar ts-node para importar o arquivo TypeScript
require("ts-node/register");

// Importar o serviço TypeScript
const forgeAuthService = require("./src/services/forgeAuthService.ts").default;

async function testeToken() {
  console.log("🧪 Teste do ForgeAuthService");
  console.log(
    "🔐 FORGE_CLIENT_ID:",
    process.env.FORGE_CLIENT_ID ? "Definido" : "NÃO DEFINIDO"
  );
  console.log(
    "🔐 FORGE_CLIENT_SECRET:",
    process.env.FORGE_CLIENT_SECRET ? "Definido" : "NÃO DEFINIDO"
  );

  try {
    console.log("\n🚀 Solicitando token...");
    const token = await forgeAuthService.getAccessToken();

    console.log("\n📊 Resultado:");
    console.log("- Tipo:", typeof token);
    console.log(
      "- Valor (primeiros 50 chars):",
      typeof token === "string" ? token.substring(0, 50) + "..." : token
    );
    console.log("- É string?", typeof token === "string");
    console.log(
      "- Tem método substring?",
      typeof token?.substring === "function"
    );

    if (typeof token === "string") {
      console.log("✅ Token é uma string válida!");
      console.log("- Tamanho:", token.length);
      console.log("- Primeiros 20 chars:", token.substring(0, 20));
    } else {
      console.log("❌ Token NÃO é uma string!");
      if (typeof token === "object" && token !== null) {
        console.log("- Propriedades:", Object.keys(token));
      }
    }
  } catch (error) {
    console.error("❌ Erro ao obter token:", error.message);
    console.error("Stack:", error.stack);
  }
}

testeToken();
