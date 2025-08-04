require("dotenv").config();
const apsService = require("./dist/services/apsService.js").default;

async function testUrn() {
  try {
    console.log("🧪 Testando URN do último upload...");

    // URN corrigida - agora com estrutura correta igual ao padrão
    const testUrn =
      "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2UtcmVhbC0xNzU0MzI4MzE5MDcyL2lmY18xNzU0MzI4MzE5MDcyX3Rlc3Qtc21hbGwuSUZD";

    console.log(`URN a ser testado: ${testUrn}`);

    const result = await apsService.testUrn(testUrn);
    console.log("✅ Resultado do teste:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("❌ Erro no teste:", error.message);
  }
}

// Para testar um objectId específico e gerar o URN
function generateUrnFromObjectId(objectId) {
  console.log(`\n🔧 Gerando URN para objectId: ${objectId}`);

  const fullObjectId = objectId.startsWith("urn:")
    ? objectId
    : `urn:adsk.objects:os.object:${objectId}`;

  console.log(`Full Object ID: ${fullObjectId}`);

  const urn = Buffer.from(fullObjectId).toString("base64").replace(/=/g, "");
  console.log(`URN gerado: ${urn}`);

  return urn;
}

// Exemplo de uso:
// generateUrnFromObjectId('forge-real-1754318279771/ifc_1754318279771_BR6-M3.IFC');

testUrn();
