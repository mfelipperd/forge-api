// Debug específico do problema de tipo
const path = require("path");
require("dotenv").config();

async function debugEspecifico() {
  console.log("🔍 Debug específico do problema de tipo");

  // Importar com require direto
  const forgeAuthService =
    require("./src/services/forgeAuthService.js").default;

  console.log("📋 Tipo do serviço:", typeof forgeAuthService);
  console.log(
    "📋 Métodos disponíveis:",
    Object.getOwnPropertyNames(Object.getPrototypeOf(forgeAuthService))
  );

  // Limpar cache primeiro
  forgeAuthService.clearCache();
  console.log("🧹 Cache limpo");

  try {
    console.log("\n🚀 Chamando getAccessToken()...");
    const resultado = await forgeAuthService.getAccessToken();

    console.log("\n📊 Análise do resultado:");
    console.log("- Tipo real:", typeof resultado);
    console.log("- Constructor:", resultado?.constructor?.name);
    console.log("- É string?", typeof resultado === "string");
    console.log("- É objeto?", typeof resultado === "object");
    console.log("- É null?", resultado === null);
    console.log("- É undefined?", resultado === undefined);

    if (typeof resultado === "object" && resultado !== null) {
      console.log("- Chaves do objeto:", Object.keys(resultado));
      console.log("- Tem access_token?", "access_token" in resultado);
      if ("access_token" in resultado) {
        console.log("- Tipo access_token:", typeof resultado.access_token);
        console.log(
          "- access_token é string?",
          typeof resultado.access_token === "string"
        );
        if (typeof resultado.access_token === "string") {
          console.log(
            "- access_token (20 chars):",
            resultado.access_token.substring(0, 20)
          );
        }
      }
    }

    if (typeof resultado === "string") {
      console.log("✅ Resultado é string válida!");
      console.log("- Tamanho:", resultado.length);
      console.log("- Primeiros 30 chars:", resultado.substring(0, 30));
    } else {
      console.log("❌ Resultado NÃO é string!");
      console.log("- Valor completo:", resultado);
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
    console.error("Stack:", error.stack);
  }
}

debugEspecifico();
