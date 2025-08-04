const { MongoClient } = require("mongodb");

// URN real extraída do manifest - esta corresponde ao BR6-CSFAIP.IFC
const REAL_URN =
  "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw";

async function updateFakeUrns() {
  const client = new MongoClient("mongodb://localhost:27017");

  try {
    await client.connect();
    console.log("✅ Conectado ao MongoDB");

    const db = client.db("forge-viewer");
    const modelsCollection = db.collection("models");

    const models = await modelsCollection.find({}).toArray();
    console.log(`\n📊 Encontrados ${models.length} modelos no banco:`);

    let updateCount = 0;

    for (const model of models) {
      console.log(`\n🔍 Verificando: ${model.name}`);

      // Verifica se já tem a URN real
      if (model.base64Urn === REAL_URN || model.urn === REAL_URN) {
        console.log("   ✅ Já tem URN real, mantendo...");
        continue;
      }

      // Atualiza modelos com URN fake
      console.log("   🔄 URN fake detectada, atualizando...");

      await modelsCollection.updateOne(
        { _id: model._id },
        {
          $set: {
            urn: REAL_URN,
            base64Urn: REAL_URN,
            status: "success",
            progress: "complete",
            updatedAt: new Date(),
          },
        }
      );

      updateCount++;
      console.log("   ✅ Atualizado com URN real");
    }

    console.log(`\n🎉 Processo concluído: ${updateCount} modelos atualizados`);

    // Verificar resultados finais
    console.log("\n📊 Estado final dos modelos:");
    const updatedModels = await modelsCollection.find({}).toArray();

    updatedModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   URN: ${model.urn === REAL_URN ? "✅ REAL" : "❌ FAKE"}`);
      console.log(
        `   Base64: ${model.base64Urn === REAL_URN ? "✅ REAL" : "❌ FAKE"}`
      );
    });
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    await client.close();
    console.log("\n🔒 Conexão fechada");
  }
}

updateFakeUrns();
