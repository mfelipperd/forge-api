// Script para limpar banco e deixar apenas URNs válidas
require("dotenv").config();
const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema(
  {
    name: String,
    fileName: String,
    urn: String,
    base64Urn: String,
    status: {
      type: String,
      enum: ["uploaded", "translating", "success", "failed"],
    },
    progress: String,
    fileSize: Number,
    fileType: String,
    description: String,
    tags: [String],
    uploadDate: { type: Date, default: Date.now },
    metadata: {
      ifcTypes: [String],
      hasProperties: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

const Model = mongoose.model("Model", modelSchema);

// Schema para CustomModels (nova coleção)
const customModelSchema = new mongoose.Schema(
  {
    _id: String,
    name: String,
    fileName: String,
    urn: String,
    description: String,
    status: {
      type: String,
      enum: ["processing", "ready", "error"],
      default: "processing",
    },
    uploadedAt: { type: Date, default: Date.now },
    metadata: {
      fileSize: Number,
      software: String,
      version: String,
      elements: {
        doors: { type: Number, default: 0 },
        walls: { type: Number, default: 0 },
        windows: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
    },
  },
  {
    collection: "CustomModels",
    versionKey: false,
    _id: false,
    timestamps: true,
  }
);

const CustomModel = mongoose.model("CustomModels", customModelSchema);

async function cleanDatabase() {
  try {
    console.log("🔌 Conectando ao MongoDB...");
    await mongoose.connect("mongodb://localhost:27017/forge-api");
    console.log("✅ Conectado ao MongoDB!");

    // Limpar todos os modelos existentes
    console.log("🧹 Limpando modelos existentes...");
    await Model.deleteMany({});
    console.log("✅ Coleção 'Models' limpa!");

    // Limpar coleção CustomModels
    console.log("🧹 Limpando modelos personalizados...");
    await CustomModel.deleteMany({});
    console.log("✅ Coleção 'CustomModels' limpa!");

    // URN padrão válida para teste
    const DEFAULT_TEST_URN =
      "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQkFSLklGQw==";

    // Criar modelos apenas com URN válida
    const validModels = [
      {
        name: "Modelo de Teste BR6-BAR",
        fileName: "BR6-BAR.IFC",
        urn: DEFAULT_TEST_URN,
        base64Urn: DEFAULT_TEST_URN,
        status: "success",
        progress: "100%",
        fileSize: 2500000,
        fileType: "ifc",
        description: "Modelo de teste com URN válida",
        tags: ["teste", "valido", "br6"],
        metadata: {
          ifcTypes: ["IfcBuilding", "IfcWall", "IfcDoor"],
          hasProperties: true,
        },
      },
      {
        name: "Modelo de Teste Arquitetônico",
        fileName: "arquitetonico-test.ifc",
        urn: DEFAULT_TEST_URN,
        base64Urn: DEFAULT_TEST_URN,
        status: "success",
        progress: "100%",
        fileSize: 3200000,
        fileType: "ifc",
        description: "Modelo arquitetônico de teste",
        tags: ["teste", "arquitetonico", "valido"],
        metadata: {
          ifcTypes: ["IfcBuilding", "IfcSlab", "IfcColumn"],
          hasProperties: true,
        },
      },
    ];

    console.log("📝 Criando modelos com URN válida...");
    const created = await Model.insertMany(validModels);
    console.log(`✅ ${created.length} modelos criados com URN válida!`);

    // Listar modelos criados
    console.log("\n📋 Modelos no banco:");
    const models = await Model.find({}, "name fileName status urn");
    models.forEach((model, index) => {
      console.log(`${index + 1}. ${model.name}`);
      console.log(`   Status: ${model.status}`);
      console.log(`   URN: ${model.urn.substring(0, 50)}...`);
      console.log(`   ID: ${model._id}\n`);
    });

    await mongoose.disconnect();
    console.log("🔌 Desconectado do MongoDB");
    console.log("🎉 Banco limpo e pronto com URNs válidas!");
  } catch (error) {
    console.error("❌ Erro:", error.message);
    process.exit(1);
  }
}

cleanDatabase();
