// Teste do upload IFC com timeout
require("dotenv").config();
const fs = require("fs");
const path = require("path");

async function testUploadWithTimeout() {
  console.log("🧪 === TESTE UPLOAD IFC COM TIMEOUT ===");

  const filePath = path.join(__dirname, "test-sdk.ifc");

  if (!fs.existsSync(filePath)) {
    console.error("❌ Arquivo de teste não encontrado:", filePath);
    return;
  }

  const stats = fs.statSync(filePath);
  console.log("📁 Arquivo encontrado:", stats.size, "bytes");

  const startTime = Date.now();

  try {
    // Simular requisição com timeout de 10 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    console.log("🚀 Iniciando upload com timeout de 10s...");

    const response = await fetch(
      "http://localhost:8081/api/models/ifc/upload",
      {
        method: "POST",
        signal: controller.signal,
        body: (() => {
          const formData = new FormData();
          const fileBuffer = fs.readFileSync(filePath);
          const blob = new Blob([fileBuffer], {
            type: "application/octet-stream",
          });
          formData.append("ifcFile", blob, "test-sdk.ifc");
          formData.append("name", "TestSDK");
          formData.append("description", "Teste SDK com timeout");
          return formData;
        })(),
      }
    );

    clearTimeout(timeoutId);

    const elapsed = Date.now() - startTime;
    console.log(`⏱️ Tempo decorrido: ${elapsed}ms`);

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Upload concluído:", result);
    } else {
      const error = await response.text();
      console.error("❌ Erro no upload:", response.status, error);
    }
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.log(`⏱️ Tempo até erro: ${elapsed}ms`);

    if (error.name === "AbortError") {
      console.error("⏰ Upload cancelado por timeout (10s)");
    } else {
      console.error("❌ Erro no upload:", error.message);
    }
  }
}

testUploadWithTimeout();
