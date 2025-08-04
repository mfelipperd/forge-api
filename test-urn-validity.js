const fetch = require("node-fetch");

async function testURNValidity() {
  try {
    console.log("🔍 TESTANDO VALIDADE DAS URNs...\n");

    // 1. Obter token real
    console.log("1. Obtendo token...");
    const tokenResponse = await fetch("http://localhost:8081/token");
    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token;
    console.log(`✅ Token obtido: ${token.substring(0, 50)}...\n`);

    // 2. Obter lista de modelos
    console.log("2. Obtendo modelos...");
    const modelsResponse = await fetch("http://localhost:8081/api/models");
    const modelsData = await modelsResponse.json();
    console.log(`✅ ${modelsData.count} modelos encontrados\n`);

    // 3. Testar cada URN contra a API real do Autodesk
    console.log("3. Testando URNs contra API do Autodesk...\n");

    for (let i = 0; i < Math.min(3, modelsData.data.length); i++) {
      const model = modelsData.data[i];
      console.log(`🔎 Testando: ${model.name}`);
      console.log(`   URN: ${model.urn.substring(0, 60)}...`);

      try {
        // Testar manifest do modelo na API real
        const manifestResponse = await fetch(
          `https://developer.api.autodesk.com/modelderivative/v2/designdata/${model.urn}/manifest`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          console.log(
            `   ✅ URN VÁLIDA - Status: ${manifest.status || "success"}`
          );

          // Decodificar URN para mostrar o object ID
          const decodedUrn = Buffer.from(model.urn, "base64").toString();
          console.log(`   📦 Object ID: ${decodedUrn}`);
        } else {
          console.log(
            `   ⚠️ Resposta: ${manifestResponse.status} - ${manifestResponse.statusText}`
          );
          if (manifestResponse.status === 404) {
            console.log(`   ❌ URN NÃO ENCONTRADA na API do Autodesk`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Erro ao testar URN: ${error.message}`);
      }

      console.log("");
    }
  } catch (error) {
    console.error("❌ Erro no teste:", error);
  }
}

testURNValidity();
