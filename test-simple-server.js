require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

// Configuração simples do multer
const upload = multer({
  dest: "uploads/temp/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext === ".ifc" || ext === ".IFC") {
      cb(null, true);
    } else {
      cb(new Error("Apenas arquivos .ifc"));
    }
  },
});

// Rota de teste simples
app.post("/test-upload", upload.single("ifcFile"), async (req, res) => {
  console.log("🚀 Teste de upload iniciado");
  console.log("📁 Arquivo:", req.file?.originalname);
  console.log("📋 Body:", req.body);

  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Nome é obrigatório" });
  }

  // Simular processamento rápido
  console.log("✅ Arquivo recebido com sucesso!");

  setTimeout(() => {
    // Limpar arquivo temporário
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }, 1000);

  res.json({
    success: true,
    message: "Upload teste concluído",
    file: {
      name: req.file.originalname,
      size: req.file.size,
      modelName: name,
    },
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🧪 Servidor de teste rodando na porta ${PORT}`);
  console.log("📋 Endpoint: POST /test-upload");
});
