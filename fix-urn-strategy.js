const { MongoClient } = require("mongodb");

// URN real extraída do manifest - esta é do BR6-CSFAIP.IFC
const REAL_URN =
  "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw";

async function fixUrnStrategy() {
  const client = new MongoClient("mongodb://localhost:27017");

  try {
    await client.connect();
    console.log("✅ Conectado ao MongoDB");

    const db = client.db("forge-viewer");
    const modelsCollection = db.collection("models");

    const models = await modelsCollection.find({}).toArray();
    console.log(`\n📊 Estratégia de correção das URNs:\n`);

    for (const model of models) {
      console.log(`🔍 ${model.name}:`);

      // Se é o modelo BR6-CSFAIP, deve usar a URN real
      if (
        model.name.includes("BR6-CSFAIP") ||
        model.fileName === "BR6-CSFAIP.IFC"
      ) {
        console.log("   ✅ Este é o modelo que corresponde à URN real");

        if (model.urn !== REAL_URN || model.base64Urn !== REAL_URN) {
          console.log("   🔄 Atualizando para URN real...");

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
          console.log("   ✅ Atualizado com URN real");
        } else {
          console.log("   ✅ Já está correto");
        }
      } else {
        // Para outros modelos, vamos remover a URN real se estiver lá
        if (model.urn === REAL_URN) {
          console.log(
            "   🔄 Removendo URN real (não corresponde a este modelo)..."
          );

          // Gerar uma URN fake única baseada no nome do arquivo
          const fakeBuName =
            model.fileName || model.name.replace(/[^a-zA-Z0-9]/g, "-");
          const fakeUrn = `urn:adsk.objects:os.object:forge-viewer-models/${fakeBuName}`;
          const fakeBase64 = Buffer.from(fakeUrn).toString("base64");

          await modelsCollection.updateOne(
            { _id: model._id },
            {
              $set: {
                urn: fakeUrn,
                base64Urn: fakeBase64,
                status: "success",
                progress: "complete",
                updatedAt: new Date(),
              },
            }
          );
          console.log(`   ✅ Atualizado com URN fake: ${fakeBuName}`);
        } else {
          console.log("   ✅ URN fake já está correta");
        }
      }
    }

    console.log("\n🎉 Correção concluída!");

    // Verificar resultados finais
    console.log("\n📊 Estado final:");
    const updatedModels = await modelsCollection.find({}).toArray();

    updatedModels.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   URN: ${model.urn}`);
      console.log(`   Tipo: ${model.urn === REAL_URN ? "✅ REAL" : "🔧 FAKE"}`);
    });
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    await client.close();
    console.log("\n🔒 Conexão fechada");
  }
}

fixUrnStrategy();
