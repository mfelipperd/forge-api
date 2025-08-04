// Comparação de URNs - Modelo Padrão vs BR6-CS.ifc

const Buffer = require("buffer").Buffer;

console.log("🔍 COMPARAÇÃO DE URNs\n");

// URN do modelo padrão (DEFAULT_TEST_URN)
const urnPadrao =
  "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw";

// URN do BR6-CS.ifc que acabamos de fazer upload
const urnBR6CS =
  "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2UtcmVhbC0xNzU0MzIyMjk2NTIxL2lmY18xNzU0MzIyMjk2NTIxX0JSNi1DUy5pZmM";

console.log("📋 URN MODELO PADRÃO:");
console.log(`Base64: ${urnPadrao}`);
const decodedPadrao = Buffer.from(urnPadrao, "base64").toString();
console.log(`Decodificado: ${decodedPadrao}`);

console.log("\n📋 URN BR6-CS.IFC:");
console.log(`Base64: ${urnBR6CS}`);
const decodedBR6CS = Buffer.from(urnBR6CS, "base64").toString();
console.log(`Decodificado: ${decodedBR6CS}`);

console.log("\n🔍 ANÁLISE DAS DIFERENÇAS:");

// Extrair componentes
const padraoParts = decodedPadrao.split(":");
const br6csParts = decodedBR6CS.split(":");

console.log("\n🧩 COMPONENTES MODELO PADRÃO:");
padraoParts.forEach((part, index) => {
  console.log(`  [${index}] ${part}`);
});

console.log("\n🧩 COMPONENTES BR6-CS:");
br6csParts.forEach((part, index) => {
  console.log(`  [${index}] ${part}`);
});

console.log("\n📊 COMPARAÇÃO DETALHADA:");
console.log(
  "Esquema URN:",
  padraoParts[0] === br6csParts[0] ? "✅ Igual" : "❌ Diferente"
);
console.log(
  "Namespace:",
  padraoParts[1] === br6csParts[1] ? "✅ Igual" : "❌ Diferente"
);
console.log(
  "Tipo Objeto:",
  padraoParts[2] === br6csParts[2] ? "✅ Igual" : "❌ Diferente"
);
console.log(
  "Bucket:",
  padraoParts[3] === br6csParts[3]
    ? "✅ Igual"
    : `❌ Diferente - Padrão: "${padraoParts[3]}" vs BR6-CS: "${br6csParts[3]}"`
);
console.log(
  "Arquivo:",
  padraoParts[4] === br6csParts[4]
    ? "✅ Igual"
    : `❌ Diferente - Padrão: "${padraoParts[4]}" vs BR6-CS: "${br6csParts[4]}"`
);

console.log("\n💡 CONCLUSÕES:");
console.log(
  "1. Estrutura URN: Ambas seguem o padrão urn:adsk.objects:os.object"
);
console.log("2. Diferença principal: Bucket name e object name");
console.log(`3. Modelo padrão usa bucket: "forge-viewer-models"`);
console.log(`4. BR6-CS usa bucket temporário: "${br6csParts[3]}"`);
console.log("5. Ambas terminam com .IFC - formato correto");

// Testar se ambas URNs têm formato válido para viewer
console.log("\n🧪 VALIDAÇÃO DE FORMATO:");
const isValidFormat = (decoded) => {
  return (
    decoded.startsWith("urn:adsk.objects:os.object:") &&
    (decoded.endsWith(".IFC") || decoded.endsWith(".ifc"))
  );
};

console.log(
  `Modelo padrão válido: ${isValidFormat(decodedPadrao) ? "✅" : "❌"}`
);
console.log(`BR6-CS válido: ${isValidFormat(decodedBR6CS) ? "✅" : "❌"}`);
