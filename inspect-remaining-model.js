const { MongoClient } = require("mongodb");

async function inspectRemainingModel() {
  const client = new MongoClient("mongodb://localhost:27017");

  try {
    await client.connect();
    console.log("✅ Conectado ao MongoDB");

    const db = client.db("forge-viewer");
    const modelsCollection = db.collection("models");

    const models = await modelsCollection.find({}).toArray();
    console.log(`\n📊 Modelos no banco: ${models.length}`);

    models.forEach((model, index) => {
      console.log(`\n${index + 1}. ${model.name}:`);
      console.log(`   ID: ${model._id}`);
      console.log(`   URN: ${model.urn}`);
      console.log(`   Base64URN: ${model.base64Urn}`);

      // Decodificar URNs
      if (model.urn) {
        try {
          const decodedUrn = Buffer.from(model.urn, "base64").toString("utf-8");
          console.log(`   URN decodificada: ${decodedUrn}`);
          console.log(
            `   Contém 'forge-viewer-models/': ${decodedUrn.includes(
              "forge-viewer-models/"
            )}`
          );
        } catch (error) {
          console.log(`   Erro ao decodificar URN: ${error.message}`);
        }
      }

      if (model.base64Urn) {
        try {
          const decodedBase64 = Buffer.from(model.base64Urn, "base64").toString(
            "utf-8"
          );
          console.log(`   Base64URN decodificada: ${decodedBase64}`);
          console.log(
            `   Contém 'forge-viewer-models/': ${decodedBase64.includes(
              "forge-viewer-models/"
            )}`
          );
        } catch (error) {
          console.log(`   Erro ao decodificar Base64URN: ${error.message}`);
        }
      }
    });
  } catch (error) {
    console.error("❌ Erro:", error);
  } finally {
    await client.close();
    console.log("\n🔒 Conexão fechada");
  }
}

inspectRemainingModel();
