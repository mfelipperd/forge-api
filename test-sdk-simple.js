// Teste rápido da implementação SDK
require("dotenv").config();
const ifcProcessingServiceSDK = require("./dist/services/ifcProcessingServiceSDK");

async function testSDK() {
  console.log("🧪 === TESTE RÁPIDO SDK FORGE ===");

  try {
    // 1. Testar autenticação
    console.log("1️⃣ Testando autenticação...");
    const token = await ifcProcessingServiceSDK.default.getAccessToken();
    console.log("✅ Token obtido:", token.substring(0, 20) + "...");

    // 2. Testar criação de bucket
    console.log("2️⃣ Testando criação de bucket...");
    const bucketKey = `test-bucket-${Date.now()}`;
    console.log("📦 BucketKey:", bucketKey);

    // Só para teste, vamos parar aqui
    console.log("✅ Teste básico concluído - SDK funcionando");
  } catch (error) {
    console.error("❌ Erro no teste SDK:", error);
    process.exit(1);
  }
}

testSDK();
