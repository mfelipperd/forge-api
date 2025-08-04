// Script para listar modelos no banco
require("dotenv").config();
const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    name: String,
    fileName: String,
    urn: String,
    base64Urn: String,
    status: String,
    progress: String,
    fileSize: Number,
    fileType: String,
    description: String,
    tags: [String],
    uploadDate: Date,
    metadata: {
      ifcTypes: [String],
      hasProperties: Boolean,
    },
  },
  { timestamps: true }
);

const Model = mongoose.model("Model", modelSchema);

async function listModels() {
  try {
    console.log("🔌 Conectando ao MongoDB...");
    await mongoose.connect("mongodb://localhost:27017/forge-api");
    console.log("✅ Conectado ao MongoDB!");

    const models = await Model.find({});
    console.log(`\n📊 Total de modelos: ${models.length}\n`);

    if (models.length === 0) {
      console.log("❌ Nenhum modelo encontrado no banco de dados");
    } else {
      models.forEach((model, index) => {
        console.log(`📋 Modelo ${index + 1}:`);
        console.log(`   ID: ${model._id}`);
        console.log(`   Nome: ${model.name}`);
        console.log(`   Arquivo: ${model.fileName}`);
        console.log(`   Status: ${model.status}`);
        console.log(`   Progresso: ${model.progress}`);
        console.log(
          `   URN: ${
            model.base64Urn ? model.base64Urn.substring(0, 50) + "..." : "N/A"
          }`
        );
        console.log(`   Descrição: ${model.description}`);
        console.log(`   Tags: ${model.tags ? model.tags.join(", ") : "N/A"}`);
        console.log(`   Data Upload: ${model.uploadDate}`);
        console.log(`   Criado em: ${model.createdAt}`);
        console.log("   ---\n");
      });
    }

    await mongoose.disconnect();
    console.log("🔌 Desconectado do MongoDB");
  } catch (error) {
    console.error("❌ Erro:", error.message);
    process.exit(1);
  }
}

listModels();
