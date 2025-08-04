const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");

async function testUpload() {
  try {
    console.log("🚀 Iniciando teste de upload IFC real...");

    const filePath = "C:\\Users\\felip\\Documents\\br6-17.5kv\\IFC\\BR6-M3.IFC";

    // Verificar se arquivo existe
    if (!fs.existsSync(filePath)) {
      console.error("❌ Arquivo não encontrado:", filePath);
      return;
    }

    const stats = fs.statSync(filePath);
    console.log(`📁 Arquivo encontrado: ${stats.size} bytes`);

    // Criar FormData
    const form = new FormData();
    form.append("ifcFile", fs.createReadStream(filePath));
    form.append("name", "BR6-M3 Teste Real");
    form.append(
      "description",
      "Teste com arquivo IFC real usando Model Derivative API"
    );

    console.log("📤 Enviando arquivo...");

    const response = await axios.post(
      "http://localhost:8082/api/models/ifc/upload",
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        timeout: 120000, // 2 minutos
      }
    );

    console.log("✅ Upload realizado com sucesso!");
    console.log("📋 Resposta:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("❌ Erro no upload:", error.message);
    if (error.response) {
      console.error("📋 Resposta do servidor:", error.response.data);
    }
  }
}

testUpload();
