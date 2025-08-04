# 🚀 Guia de Integração Frontend - Upload IFC Automático

## 📋 Visão Geral

A API Forge agora oferece **upload automático de arquivos IFC** com processamento completo:

- ✅ Upload de arquivo IFC via FormData
- ✅ Criação automática de bucket OSS
- ✅ Conversão para Model Derivative
- ✅ Geração de URN para Forge Viewer
- ✅ Monitoramento de progresso

## 🎯 Endpoint Principal

### **POST /api/models/ifc/upload**

```http
POST http://localhost:8081/api/models/ifc/upload
Content-Type: multipart/form-data
```

**Parâmetros FormData:**

- `ifcFile`: Arquivo .ifc (obrigatório)
- `name`: Nome do modelo (obrigatório)
- `description`: Descrição do modelo (opcional)

**Resposta de Sucesso:**

```json
{
  "success": true,
  "urn": "dXJuOmFkc2sub2JqZWN0c...",
  "objectId": "urn:adsk.objects:os.object:bucket/file.ifc",
  "translationStatus": "inprogress"
}
```

**Resposta de Erro:**

```json
{
  "success": false,
  "error": "Descrição do erro",
  "details": "Detalhes técnicos"
}
```

## 💻 Implementação Frontend

### **JavaScript Puro**

```javascript
async function uploadIFCFile(file, name, description = "") {
  const formData = new FormData();
  formData.append("ifcFile", file);
  formData.append("name", name);
  formData.append("description", description);

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
      console.log("✅ Upload realizado com sucesso!");
      console.log("URN para Forge Viewer:", result.urn);
      return result;
    } else {
      throw new Error(result.error || "Erro no upload");
    }
  } catch (error) {
    console.error("❌ Erro no upload:", error);
    throw error;
  }
}

// Exemplo de uso
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById("ifcFile");
  const nameInput = document.getElementById("modelName");
  const descInput = document.getElementById("modelDescription");

  if (fileInput.files.length === 0) {
    alert("Selecione um arquivo IFC");
    return;
  }

  try {
    // Validar arquivo
    const file = fileInput.files[0];
    if (!file.name.toLowerCase().endsWith(".ifc")) {
      throw new Error("Por favor, selecione um arquivo .ifc");
    }

    // Fazer upload
    const result = await uploadIFCFile(file, nameInput.value, descInput.value);

    // Usar URN no Forge Viewer
    alert(`Upload concluído! URN: ${result.urn}`);

    // Opcional: carregar no viewer
    // loadModelInViewer(result.urn);
  } catch (error) {
    alert("Erro no upload: " + error.message);
  }
});
```

### **React Component**

```jsx
import React, { useState } from "react";

function IFCUploader() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Selecione um arquivo IFC");
      return;
    }

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("ifcFile", file);
    formData.append("name", name);
    formData.append("description", description);

    try {
      const response = await fetch(
        "http://localhost:8081/api/models/ifc/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult(data);
        alert("Upload realizado com sucesso!");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro no upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h2>Upload Arquivo IFC</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Arquivo IFC:</label>
          <input
            type="file"
            accept=".ifc"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>

        <div>
          <label>Nome do Modelo:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
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

      {result && (
        <div
          style={{ marginTop: "20px", padding: "10px", background: "#f0f8ff" }}
        >
          <h3>✅ Upload Concluído!</h3>
          <p>
            <strong>URN:</strong> {result.urn}
          </p>
          <p>
            <strong>Status:</strong> {result.translationStatus}
          </p>
          <p>
            <strong>Object ID:</strong> {result.objectId}
          </p>
        </div>
      )}
    </div>
  );
}

export default IFCUploader;
```

### **Vue.js Component**

```vue
<template>
  <div>
    <h2>Upload Arquivo IFC</h2>

    <form @submit.prevent="handleUpload">
      <div>
        <label>Arquivo IFC:</label>
        <input type="file" @change="handleFileSelect" accept=".ifc" required />
      </div>

      <div>
        <label>Nome do Modelo:</label>
        <input v-model="modelName" type="text" required />
      </div>

      <div>
        <label>Descrição:</label>
        <textarea v-model="modelDescription" rows="3"></textarea>
      </div>

      <button type="submit" :disabled="uploading">
        {{ uploading ? "Processando..." : "Upload IFC" }}
      </button>
    </form>

    <div v-if="result" class="result">
      <h3>✅ Upload Concluído!</h3>
      <p><strong>URN:</strong> {{ result.urn }}</p>
      <p><strong>Status:</strong> {{ result.translationStatus }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedFile: null,
      modelName: "",
      modelDescription: "",
      uploading: false,
      result: null,
    };
  },
  methods: {
    handleFileSelect(event) {
      this.selectedFile = event.target.files[0];
    },

    async handleUpload() {
      if (!this.selectedFile) {
        alert("Selecione um arquivo IFC");
        return;
      }

      this.uploading = true;
      this.result = null;

      const formData = new FormData();
      formData.append("ifcFile", this.selectedFile);
      formData.append("name", this.modelName);
      formData.append("description", this.modelDescription);

      try {
        const response = await fetch(
          "http://localhost:8081/api/models/ifc/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        if (data.success) {
          this.result = data;
          this.$emit("upload-success", data);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro no upload: " + error.message);
      } finally {
        this.uploading = false;
      }
    },
  },
};
</script>

<style scoped>
.result {
  margin-top: 20px;
  padding: 15px;
  background: #f0f8ff;
  border-radius: 5px;
}
</style>
```

## 🎨 HTML Completo de Exemplo

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Upload IFC - Forge API</title>
    <style>
      body {
        font-family: Arial, sans-serif;
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

      input[type="file"],
      input[type="text"],
      textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
      }

      button {
        background: #007acc;
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
      }

      button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      .result {
        margin-top: 20px;
        padding: 15px;
        background: #d4edda;
        border: 1px solid #c3e6cb;
        border-radius: 4px;
      }

      .error {
        margin-top: 20px;
        padding: 15px;
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <h1>🚀 Upload Arquivo IFC</h1>

    <form id="uploadForm">
      <div class="form-group">
        <label for="ifcFile">Arquivo IFC:</label>
        <input type="file" id="ifcFile" accept=".ifc" required />
        <small>Selecione um arquivo .ifc válido</small>
      </div>

      <div class="form-group">
        <label for="modelName">Nome do Modelo:</label>
        <input
          type="text"
          id="modelName"
          placeholder="Ex: Projeto Casa Verde"
          required
        />
      </div>

      <div class="form-group">
        <label for="modelDescription">Descrição (opcional):</label>
        <textarea
          id="modelDescription"
          rows="3"
          placeholder="Descrição do projeto..."
        ></textarea>
      </div>

      <button type="submit" id="uploadBtn">Upload IFC</button>
    </form>

    <div id="result" style="display: none;"></div>

    <script>
      document
        .getElementById("uploadForm")
        .addEventListener("submit", async (e) => {
          e.preventDefault();

          const fileInput = document.getElementById("ifcFile");
          const nameInput = document.getElementById("modelName");
          const descInput = document.getElementById("modelDescription");
          const uploadBtn = document.getElementById("uploadBtn");
          const resultDiv = document.getElementById("result");

          // Validar arquivo
          if (fileInput.files.length === 0) {
            alert("Selecione um arquivo IFC");
            return;
          }

          const file = fileInput.files[0];
          if (!file.name.toLowerCase().endsWith(".ifc")) {
            alert("Por favor, selecione um arquivo .ifc válido");
            return;
          }

          // Preparar FormData
          const formData = new FormData();
          formData.append("ifcFile", file);
          formData.append("name", nameInput.value);
          formData.append("description", descInput.value);

          // Atualizar UI
          uploadBtn.disabled = true;
          uploadBtn.textContent = "Processando...";
          resultDiv.style.display = "none";

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
              resultDiv.className = "result";
              resultDiv.innerHTML = `
                        <h3>✅ Upload Concluído com Sucesso!</h3>
                        <p><strong>Nome:</strong> ${nameInput.value}</p>
                        <p><strong>URN:</strong> <code>${result.urn}</code></p>
                        <p><strong>Object ID:</strong> <code>${result.objectId}</code></p>
                        <p><strong>Status de Tradução:</strong> ${result.translationStatus}</p>
                        <p><em>A URN pode ser usada no Forge Viewer para visualizar o modelo.</em></p>
                    `;
            } else {
              throw new Error(result.error || "Erro desconhecido");
            }
          } catch (error) {
            console.error("Erro no upload:", error);
            resultDiv.className = "error";
            resultDiv.innerHTML = `
                    <h3>❌ Erro no Upload</h3>
                    <p>${error.message}</p>
                `;
          } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = "Upload IFC";
            resultDiv.style.display = "block";
          }
        });
    </script>
  </body>
</html>
```

## ⚙️ Verificação de Status (Opcional)

Se quiser monitorar o progresso da tradução:

```javascript
async function checkTranslationStatus(urn) {
  try {
    const response = await fetch(
      `http://localhost:8081/api/models/ifc/status/${encodeURIComponent(urn)}`
    );
    const status = await response.json();

    console.log(`Status: ${status.status} - Progresso: ${status.progress}`);

    return status;
  } catch (error) {
    console.error("Erro ao verificar status:", error);
    return null;
  }
}
```

## 🔧 Outros Endpoints Úteis

### Obter Token Forge

```javascript
const tokenResponse = await fetch("http://localhost:8081/token");
const tokenData = await tokenResponse.json();
```

### Listar Modelos Personalizados

```javascript
const modelsResponse = await fetch("http://localhost:8081/api/models/custom");
const models = await modelsResponse.json();
```

## ⚠️ Considerações Importantes

1. **CORS**: Backend já configurado com `cors({ origin: "*" })`
2. **Tamanho de Arquivo**: Sem limite específico configurado
3. **Timeout**: Para arquivos grandes, considere aumentar timeout
4. **Validação**: Sempre validar extensão `.ifc` no frontend
5. **Credenciais**: Certifique-se que `FORGE_CLIENT_ID` e `FORGE_CLIENT_SECRET` estão configuradas
6. **MongoDB**: Banco deve estar conectado para salvar metadados

## 🔧 Configuração de Permissões Forge

### **❌ Erro AUTH-010 - Token sem privilégios**

Se você receber este erro:

```json
{
  "success": false,
  "error": "Erro no processamento do arquivo IFC",
  "details": "Erro ao criar bucket: { \"developerMessage\":\"Token does not have the privilege for this request.\", \"moreInfo\": \"https://aps.autodesk.com/en/docs/oauth/v2/developers_guide/error_handling/\", \"errorCode\": \"AUTH-010\"}"
}
```

### **✅ Solução - Verificar Scopes do Token**

O problema está nas **permissões do token**. Verifique se o backend está solicitando os **scopes corretos**:

**Scopes necessários para upload IFC:**

```javascript
// No forgeAuthService.js
const REQUIRED_SCOPES = [
  "data:write", // ✅ Para criar buckets
  "data:read", // ✅ Para listar buckets
  "bucket:create", // ✅ Para criar novos buckets
  "bucket:read", // ✅ Para verificar buckets existentes
  "viewables:read", // ✅ Para Model Derivative
];
```

### **🔧 Correção no Backend**

Verifique se o arquivo `forgeAuthService.js` tem os scopes corretos:

```javascript
// forgeAuthService.js - Configuração correta
const getForgeToken = async () => {
  const tokenUrl =
    "https://developer.api.autodesk.com/authentication/v1/authenticate";

  const data = {
    client_id: process.env.FORGE_CLIENT_ID,
    client_secret: process.env.FORGE_CLIENT_SECRET,
    grant_type: "client_credentials",
    scope: "data:write data:read bucket:create bucket:read viewables:read", // ✅ Scopes corretos
  };

  // ... resto da implementação
};
```

### **🔍 Verificar Credenciais Forge**

1. **Acesse o console Forge**: https://aps.autodesk.com/myapps
2. **Verifique sua aplicação**: Confirme se ela tem permissões para Data Management API
3. **Regenere as credenciais** se necessário
4. **Atualize as variáveis de ambiente**:
   ```bash
   FORGE_CLIENT_ID=seu_client_id_aqui
   FORGE_CLIENT_SECRET=seu_client_secret_aqui
   ```

### **🚨 IMPORTANTE: Ativar APIs no Console APS**

Para usar buckets e upload de arquivos, você **DEVE ativar** estas APIs no console:

#### **📋 Passo a Passo:**

1. **Acesse**: https://aps.autodesk.com/myapps
2. **Selecione sua aplicação** (ou crie uma nova)
3. **Vá para a aba "APIs & Services"**
4. **Ative as seguintes APIs**:

   ✅ **Data Management API**

   - Necessário para criar e gerenciar buckets
   - Permite upload de arquivos para OSS (Object Storage Service)

   ✅ **Model Derivative API**

   - Necessário para converter arquivos IFC
   - Gera visualizações (SVF2) para o Forge Viewer

   ⚠️ **Authentication API** - Não existe mais como API separada

   - A autenticação OAuth agora é integrada automaticamente

#### **🔧 Como Ativar:**

```
1. Console APS → Sua App → APIs & Services
2. Clique em "Add APIs"
3. Selecione APENAS:
   - ☑️ Data Management API
   - ☑️ Model Derivative API
4. Clique em "Save"
5. Aguarde alguns minutos para ativação
```

#### **⚠️ Verificação Rápida:**

Na página da sua app, você deve ver:

- ✅ **Data Management API** - Status: Active
- ✅ **Model Derivative API** - Status: Active

**Sem essas APIs ativadas, você receberá erro AUTH-010!**

### **🚨 NOVO ERRO: Legacy Endpoint Deprecated**

Se você receber este erro após ativar as APIs:

```json
{
  "success": false,
  "error": "Erro no processamento do arquivo IFC",
  "details": "Erro no upload: {\"reason\":\"Legacy endpoint is deprecated\"}"
}
```

**Problema**: O código está usando endpoints antigos do Forge que foram depreciados.

**Solução**: Atualizar URLs dos endpoints no backend para as versões mais recentes:

#### **🔧 Endpoints Corretos (já implementados no código):**

```typescript
// ✅ CORRETO - Já no código
const API_BASE = "https://developer.api.autodesk.com";

// OSS (Object Storage Service) - v2
const BUCKET_URL = `${API_BASE}/oss/v2/buckets`;
const UPLOAD_URL = `${API_BASE}/oss/v2/buckets/{bucketKey}/objects/{objectKey}`;

// Model Derivative - v2
const TRANSLATE_URL = `${API_BASE}/modelderivative/v2/designdata/job`;
const STATUS_URL = `${API_BASE}/modelderivative/v2/designdata/{urn}/manifest`;

// Authentication - v2 (também correto)
const AUTH_URL = `${API_BASE}/authentication/v2/token`;
```

#### **⚠️ Possíveis Causas do Erro "Legacy endpoint":**

1. **Cache de Token Antigo**: Limpe o cache do token
2. **Bucket Policy Antiga**: Use `persistent` ao invés de `temporary`
3. **Content-Type Incorreto**: Verifique headers do upload
4. **Timeout de Rede**: Arquivo muito grande causando timeout

#### **🔧 Correções Aplicar:**

**1. Limpar Cache do Token:**

```bash
# Reiniciar servidor para limpar cache
npm run dev
```

**2. Verificar Policy do Bucket:**

```typescript
// No ifcProcessingService.ts - usar "persistent"
const bucketData = {
  bucketKey: this.bucketKey,
  policyKey: "persistent", // ✅ ao invés de "temporary"
};
```

**3. Testar com Arquivo Menor:**

- Use um arquivo IFC de teste pequeno (< 10MB)
- Se funcionar, o problema pode ser timeout

#### **🚨 Troubleshooting Avançado "Legacy Endpoint":**

Se o erro persistir, teste os seguintes pontos:

**1. Verificar Região da Aplicação APS:**

```bash
# Algumas regiões podem ter restrições
# Tente criar nova aplicação em região US (padrão)
```

**2. Testar Endpoint Manualmente:**

```bash
# Obter token primeiro
curl -X POST https://developer.api.autodesk.com/authentication/v2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=SEU_CLIENT_ID&client_secret=SEU_CLIENT_SECRET&grant_type=client_credentials&scope=data:write data:read bucket:create bucket:read"

# Testar criação de bucket
curl -X POST https://developer.api.autodesk.com/oss/v2/buckets \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bucketKey":"test-bucket-'$(date +%s)'","policyKey":"transient"}'
```

**3. Verificar Logs Detalhados:**

- Adicione mais logs no código para identificar qual endpoint exatamente está falhando
- Verifique se o erro vem da criação do bucket ou do upload do arquivo

**4. Alternativa: Usar SDK Oficial:**

```bash
# Se o problema persistir, considere usar o SDK oficial
npm install autodesk-forge-tools
```

### **🧪 Teste de Token**

Você pode testar se o token tem as permissões corretas:

```javascript
// Teste das permissões do token
async function testTokenPermissions() {
  try {
    const tokenResponse = await fetch("http://localhost:8081/token");
    const tokenData = await tokenResponse.json();

    console.log("Token obtido:", tokenData.access_token ? "✅ OK" : "❌ Erro");

    // Teste de criação de bucket
    const testBucket = await fetch(
      "https://developer.api.autodesk.com/oss/v2/buckets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucketKey: "test-bucket-" + Date.now(),
          policyKey: "transient",
        }),
      }
    );

    if (testBucket.ok) {
      console.log("✅ Token tem permissões corretas");
    } else {
      console.log("❌ Token sem permissões:", await testBucket.text());
    }
  } catch (error) {
    console.error("Erro no teste:", error);
  }
}
```

## 🎯 Fluxo Completo

1. **Frontend**: Upload arquivo via FormData
2. **Backend**: Recebe arquivo e salva temporariamente
3. **Forge OSS**: Cria bucket automaticamente se não existir
4. **Forge OSS**: Upload do arquivo para bucket
5. **Model Derivative**: Inicia tradução para SVF2
6. **Backend**: Retorna URN para frontend
7. **Frontend**: Usa URN no Forge Viewer

## 🚨 Problema Resolvido: AUTH-010

### **❌ Erro Original**

```json
{
  "success": false,
  "error": "Erro no processamento do arquivo IFC",
  "details": "Erro ao criar bucket: { \"developerMessage\":\"Token does not have the privilege for this request.\", \"moreInfo\": \"https://aps.autodesk.com/en/docs/oauth/v2/developers_guide/error_handling/\", \"errorCode\": \"AUTH-010\"}"
}
```

### **🆕 Novo Erro: Legacy Endpoint Deprecated**

```json
{
  "success": false,
  "error": "Erro no processamento do arquivo IFC",
  "details": "Erro no upload: {\"reason\":\"Legacy endpoint is deprecated\"}"
}
```

### **✅ Solução Aplicada**

**Problema 1**: O token Forge não tinha permissões para criar buckets.
**Problema 2**: O código estava usando `policyKey: "temporary"` que foi descontinuado.

**Correções aplicadas:**

**1. Scopes corrigidos no arquivo `credentials.ts`**:

```typescript
// ANTES (escopo incompleto)
scope: "data:read data:write data:create viewables:read";

// DEPOIS (escopo corrigido)
scope: "data:read data:write data:create bucket:create bucket:read viewables:read";
```

**2. Policy do bucket corrigida no `ifcProcessingService.ts`**:

```typescript
// ANTES (policy depreciada)
policyKey: "temporary";

// DEPOIS (policy compatível)
policyKey: "transient";
```

**3. Headers de upload otimizados**:

```typescript
// ANTES (com Content-Length manual)
headers: {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/octet-stream",
  "Content-Length": fileBuffer.length.toString(),
}

// DEPOIS (deixar fetch calcular automaticamente)
headers: {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/octet-stream",
}
```

**Scopes adicionados**:

- ✅ `bucket:create` - Para criar novos buckets OSS
- ✅ `bucket:read` - Para verificar buckets existentes

**Policy atualizada**:

- ✅ `transient` - Policy básica e amplamente suportada (24h retenção)
- ❌ `temporary` - Depreciado
- ❌ `persistent` - Pode causar conflitos em algumas regiões

**Headers otimizados**:

- ✅ Remoção do `Content-Length` manual - deixar fetch calcular automaticamente
- ✅ `Content-Type: application/octet-stream` - correto para arquivos binários

### **🔧 Para Aplicar no Seu Projeto**

1. **Ative as APIs necessárias** no console APS:
   - ✅ Data Management API
   - ✅ Model Derivative API
2. **Edite `src/config/credentials.ts`**
3. **Adicione os scopes** `bucket:create bucket:read`
4. **Reinicie o servidor backend**
5. **Teste novamente o upload IFC**

### **🎯 Checklist Completo de Configuração**

#### **1. Console APS (https://aps.autodesk.com/myapps)**

- [ ] Aplicação criada
- [ ] Data Management API ativada
- [ ] Model Derivative API ativada
- [ ] Authentication API ativada
- [ ] Client ID e Secret copiados

#### **2. Variáveis de Ambiente (.env)**

```bash
FORGE_CLIENT_ID=seu_client_id_real
FORGE_CLIENT_SECRET=seu_client_secret_real
```

#### **3. Arquivo credentials.ts**

```typescript
scope: "data:read data:write data:create bucket:create bucket:read viewables:read";
```

#### **4. Teste Final**

```bash
# Reiniciar servidor
npm run dev

# Testar endpoint
curl -X POST http://localhost:8081/api/models/ifc/upload \
  -F "ifcFile=@seu_arquivo.ifc" \
  -F "name=Teste" \
  -F "description=Teste de upload"
```

**A integração está pronta para uso!** 🚀
