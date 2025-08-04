// Teste simples do servidor
const express = require("express");

const app = express();
const PORT = 8082; // Usar porta diferente para teste

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Servidor de teste funcionando",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📍 Acesse: http://localhost:${PORT}`);
});
