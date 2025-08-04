# 🚀 Guia Rápido - Integração Frontend IFC Upload

## 📋 **1. ENDPOINT PRINCIPAL**

```http
POST http://localhost:8081/api/models/ifc/upload
Content-Type: multipart/form-data
```

### Parâmetros:

- `ifcFile` (file) - **OBRIGATÓRIO** - Arquivo .ifc (máx. 100MB)
- `name` (string) - **OBRIGATÓRIO** - Nome do modelo
- `description` (string) - **OPCIONAL** - Descrição

---

## 📤 **2. RESPOSTAS**

### ✅ Sucesso:

```json
{
  "success": true,
  "model": {
    "id": "688d0921229f112c0d953eed",
    "name": "Meu Modelo",
    "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6...",
    "status": "translating",
    "progress": "0%"
  }
}
```

### ❌ Erro:

```json
{
  "success": false,
  "error": "Descrição do erro"
}
```

---

## 🔄 **3. MONITORAR STATUS**

```http
GET http://localhost:8081/api/models/ifc/status/{modelId}
```

### Status possíveis:

- `translating` - Processando
- `success` - Pronto para usar
- `failed` - Erro no processamento

---

## 💻 **4. CÓDIGO JAVASCRIPT (CÓPIA DIRETA)**

```javascript
// FUNÇÃO DE UPLOAD
async function uploadIFC(file, modelName, description = "") {
  const formData = new FormData();
  formData.append("ifcFile", file);
  formData.append("name", modelName);
  if (description) formData.append("description", description);

  try {
    const response = await fetch(
      "http://localhost:8081/api/models/ifc/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log("✅ Upload sucesso! URN:", result.model.urn);
      return result;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("❌ Erro upload:", error);
    throw error;
  }
}

// FUNÇÃO DE MONITORAMENTO
async function monitorStatus(modelId) {
  try {
    const response = await fetch(
      `http://localhost:8081/api/models/ifc/status/${modelId}`
    );
    const data = await response.json();

    console.log(
      `Status: ${data.model.status} - Progresso: ${data.model.progress}`
    );

    if (data.model.status === "success") {
      console.log("🎉 Pronto! URN:", data.model.urn);
      return data.model.urn;
    } else if (data.model.status === "failed") {
      console.error("❌ Processamento falhou");
      return null;
    } else {
      // Continuar verificando
      setTimeout(() => monitorStatus(modelId), 5000);
    }
  } catch (error) {
    console.error("Erro ao verificar status:", error);
  }
}

// USO COMPLETO
async function processarIFC(file, nome) {
  try {
    // 1. Fazer upload
    const resultado = await uploadIFC(file, nome);

    // 2. Monitorar progresso
    const urn = await monitorStatus(resultado.model.id);

    // 3. Usar URN no Forge Viewer
    if (urn) {
      // loadForgeViewer(urn); // Sua função do viewer
    }
  } catch (error) {
    alert("Erro: " + error.message);
  }
}
```

---

## 📱 **5. HTML COMPLETO (CÓPIA DIRETA)**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Upload IFC</title>
    <style>
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .form-group {
        margin-bottom: 15px;
      }
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
      }
      input,
      textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      button {
        background: #007acc;
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
      .status {
        margin-top: 20px;
        padding: 15px;
        border-radius: 4px;
      }
      .success {
        background: #d4edda;
        color: #155724;
      }
      .error {
        background: #f8d7da;
        color: #721c24;
      }
      .info {
        background: #d1ecf1;
        color: #0c5460;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🚀 Upload Arquivo IFC</h1>

      <form id="uploadForm">
        <div class="form-group">
          <label>Arquivo IFC:</label>
          <input type="file" id="ifcFile" accept=".ifc" required />
        </div>

        <div class="form-group">
          <label>Nome do Modelo:</label>
          <input
            type="text"
            id="modelName"
            placeholder="Ex: Projeto Casa Verde"
            required
          />
        </div>

        <div class="form-group">
          <label>Descrição (opcional):</label>
          <textarea
            id="description"
            rows="3"
            placeholder="Descrição do projeto..."
          ></textarea>
        </div>

        <button type="submit" id="uploadBtn">Upload IFC</button>
      </form>

      <div id="status" style="display: none;"></div>
    </div>

    <script>
      // FUNÇÕES DE UPLOAD (MESMO CÓDIGO ACIMA)
      async function uploadIFC(file, modelName, description = "") {
        const formData = new FormData();
        formData.append("ifcFile", file);
        formData.append("name", modelName);
        if (description) formData.append("description", description);

        const response = await fetch(
          "http://localhost:8081/api/models/ifc/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result;
      }

      async function monitorStatus(modelId, statusDiv) {
        const response = await fetch(
          `http://localhost:8081/api/models/ifc/status/${modelId}`
        );
        const data = await response.json();

        statusDiv.innerHTML = `
                <div class="status info">
                    📊 Status: ${data.model.status}<br>
                    ⏳ Progresso: ${data.model.progress}
                </div>
            `;

        if (data.model.status === "success") {
          statusDiv.innerHTML = `
                    <div class="status success">
                        ✅ Processamento concluído!<br>
                        🔗 URN: ${data.model.urn}<br>
                        🎉 Modelo pronto para visualização!
                    </div>
                `;
          return data.model.urn;
        } else if (data.model.status === "failed") {
          statusDiv.innerHTML = `<div class="status error">❌ Processamento falhou</div>`;
          return null;
        } else {
          setTimeout(() => monitorStatus(modelId, statusDiv), 3000);
        }
      }

      // EVENTO DO FORMULÁRIO
      document
        .getElementById("uploadForm")
        .addEventListener("submit", async (e) => {
          e.preventDefault();

          const fileInput = document.getElementById("ifcFile");
          const nameInput = document.getElementById("modelName");
          const descInput = document.getElementById("description");
          const uploadBtn = document.getElementById("uploadBtn");
          const statusDiv = document.getElementById("status");

          if (!fileInput.files[0]) {
            alert("Selecione um arquivo IFC");
            return;
          }

          try {
            uploadBtn.disabled = true;
            uploadBtn.textContent = "Processando...";
            statusDiv.style.display = "block";
            statusDiv.innerHTML =
              '<div class="status info">🔄 Fazendo upload...</div>';

            // Upload
            const result = await uploadIFC(
              fileInput.files[0],
              nameInput.value,
              descInput.value
            );

            statusDiv.innerHTML = `
                    <div class="status success">
                        ✅ Upload concluído!<br>
                        📋 ID: ${result.model.id}<br>
                        🔄 Iniciando processamento...
                    </div>
                `;

            // Monitorar
            await monitorStatus(result.model.id, statusDiv);
          } catch (error) {
            statusDiv.innerHTML = `<div class="status error">❌ Erro: ${error.message}</div>`;
          } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = "Upload IFC";
          }
        });
    </script>
  </body>
</html>
```

---

## ⚡ **6. REACT COMPONENT (CÓPIA DIRETA)**

```jsx
import React, { useState } from "react";

function IFCUploader() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);

  const uploadIFC = async (file, name, description) => {
    const formData = new FormData();
    formData.append("ifcFile", file);
    formData.append("name", name);
    if (description) formData.append("description", description);

    const response = await fetch(
      "http://localhost:8081/api/models/ifc/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result;
  };

  const monitorStatus = async (modelId) => {
    const checkStatus = async () => {
      const response = await fetch(
        `http://localhost:8081/api/models/ifc/status/${modelId}`
      );
      const data = await response.json();

      setStatus(data.model);

      if (data.model.status === "success") {
        console.log("✅ URN pronta:", data.model.urn);
      } else if (data.model.status !== "failed") {
        setTimeout(checkStatus, 3000);
      }
    };
    checkStatus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setStatus(null);

    try {
      const result = await uploadIFC(file, name, description);
      await monitorStatus(result.model.id);
    } catch (error) {
      setStatus({ status: "error", error: error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2>🚀 Upload Arquivo IFC</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Arquivo IFC:</label>
          <input
            type="file"
            accept=".ifc"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Nome do Modelo:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Descrição:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
        </div>

        <button type="submit" disabled={uploading}>
          {uploading ? "Processando..." : "Upload IFC"}
        </button>
      </form>

      {status && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            borderRadius: "4px",
            backgroundColor:
              status.status === "success"
                ? "#d4edda"
                : status.status === "error"
                ? "#f8d7da"
                : "#d1ecf1",
          }}
        >
          {status.status === "success" ? (
            <>✅ Concluído! URN: {status.urn}</>
          ) : status.status === "error" ? (
            <>❌ Erro: {status.error}</>
          ) : (
            <>
              🔄 {status.status} - {status.progress}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default IFCUploader;
```

---

## 🎯 **7. CHECKLIST RÁPIDO**

```
✅ Endpoint: POST /api/models/ifc/upload
✅ Parâmetros: ifcFile (file), name (string)
✅ Resposta: { success: true, model: { id, urn, status } }
✅ Monitor: GET /api/models/ifc/status/:id
✅ Status: translating → success → usar URN
✅ Forge Viewer: usar URN quando status = success
```

---

## 🚨 **8. ERROS COMUNS**

| Erro  | Causa                | Solução            |
| ----- | -------------------- | ------------------ |
| `400` | Arquivo/nome ausente | Verificar FormData |
| `409` | Nome já existe       | Usar nome único    |
| `500` | Erro servidor        | Verificar logs     |
| CORS  | Origem bloqueada     | Configurar CORS    |

---

## 🎉 **PRONTO!**

**Copie qualquer seção acima e cole diretamente no seu projeto!**

**URN retornada pode ser usada diretamente no Forge Viewer! 🚀**
