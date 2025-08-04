// Script para debugar o token do Forge
import forgeAuthService from "./src/services/forgeAuthService.js";

async function debugToken() {
  console.log("🔍 Iniciando debug do token...");

  try {
    const token = await forgeAuthService.getAccessToken();

    console.log("📊 Análise completa do token:");
    console.log("- Tipo:", typeof token);
    console.log("- Valor:", token);
    console.log("- Constructor:", token?.constructor?.name);
    console.log("- É string?", typeof token === "string");
    console.log("- Tem substring?", typeof token?.substring === "function");

    if (typeof token === "object") {
      console.log("- Keys:", Object.keys(token));
      console.log("- Prototype:", Object.getPrototypeOf(token));
    }

    if (token && typeof token === "string") {
      console.log(
        "✅ Token é string válida, primeiros 20 chars:",
        token.substring(0, 20)
      );
    } else {
      console.log("❌ Token não é uma string!");
    }
  } catch (error) {
    console.error("❌ Erro ao obter token:", error.message);
  }
}

debugToken();
