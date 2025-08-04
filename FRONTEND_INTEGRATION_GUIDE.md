# 🚀 Guia de Integração Frontend - Forge API Simplificada

## 📋 Visão Geral

API simplificada baseada no padrão **MERN-Stack-Revit-Forge-Viewer** do portfólio, otimizada para integração com Autodesk Forge.

**URL Base**: `http://localhost:8081`

## 🔥 Principais Endpoints

### 1. ⭐ **URN do Modelo Principal**

```javascript
// Obter URN do modelo BR6-CSFAIP.IFC
const response = await fetch("http://localhost:8081/api/model/urn");
const data = await response.json();

console.log(data);
/* Retorna:
{
  "success": true,
  "model": {
    "id": "br6-csfaip",
    "name": "Edifício BR6-CSFAIP", 
    "fileName": "BR6-CSFAIP.IFC",
    "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw",
    "status": "ready"
  }
}
*/
```

### 2. 🔐 **Token Autodesk Forge**

```javascript
// Obter token de acesso para o Forge Viewer
const tokenResponse = await fetch("http://localhost:8081/token");
const tokenData = await tokenResponse.json();

// Use o token no Forge Viewer
const viewer = new Autodesk.Viewing.GuiViewer3D(container, {
  accessToken: tokenData.access_token,
});
```

### 3. 📊 **Status da API**

```javascript
// Verificar status e informações da API
const statusResponse = await fetch("http://localhost:8081/");
const status = await statusResponse.json();

console.log(status);
/* Retorna:
{
  "message": "🚀 Forge API - Model Viewer",
  "version": "1.0.0",
  "model": {
    "name": "Edifício BR6-CSFAIP",
    "fileName": "BR6-CSFAIP.IFC", 
    "status": "ready"
  },
  "endpoints": {
    "token": "/token",
    "model": "/api/model/urn",
    "doors": "/api/doors"
  }
}
*/
```

### 4. 🏗️ **Propriedades do Modelo**

```javascript
// Obter propriedades e metadados do modelo IFC
const urn =
  "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw";
const propsResponse = await fetch(
  `http://localhost:8081/api/model/${urn}/properties`
);
const properties = await propsResponse.json();

console.log(properties.model.properties);
/* Retorna:
{
  "fileType": "IFC",
  "elements": {
    "doors": 0,
    "walls": 0, 
    "windows": 0,
    "total": 0
  },
  "metadata": {
    "created": "2025-07-31",
    "software": "Autodesk Revit",
    "version": "2024"
  }
}
*/
```

### 5. 🚪 **Sistema de Portas (CRUD)**

```javascript
// Listar todas as portas
const doorsResponse = await fetch("http://localhost:8081/api/doors");
const doors = await doorsResponse.json();

// Criar nova porta
const newDoor = {
  name: "Porta Principal",
  location: "Entrada",
  type: "Pivotante",
};

const createResponse = await fetch("http://localhost:8081/api/doors", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(newDoor),
});
```

## 🎯 Integração com Forge Viewer

### Exemplo Completo de Inicialização:

```javascript
class ForgeViewer {
  constructor(container) {
    this.container = container;
    this.viewer = null;
  }

  async initialize() {
    try {
      // 1. Obter token
      const tokenResponse = await fetch("http://localhost:8081/token");
      const tokenData = await tokenResponse.json();

      // 2. Obter URN do modelo
      const modelResponse = await fetch("http://localhost:8081/api/model/urn");
      const modelData = await modelResponse.json();

      // 3. Inicializar Forge Viewer
      const options = {
        env: "AutodeskProduction",
        api: "derivativeV2",
        accessToken: tokenData.access_token,
      };

      Autodesk.Viewing.Initializer(options, () => {
        this.viewer = new Autodesk.Viewing.GuiViewer3D(this.container);
        this.viewer.start();

        // 4. Carregar modelo
        this.viewer.loadModel(
          `urn:${modelData.model.urn}`,
          undefined,
          this.onLoadSuccess.bind(this),
          this.onLoadError.bind(this)
        );
      });
    } catch (error) {
      console.error("Erro na inicialização:", error);
    }
  }

  onLoadSuccess() {
    console.log("✅ Modelo carregado com sucesso!");
    console.log("🏗️ Modelo:", "BR6-CSFAIP.IFC");
  }

  onLoadError(error) {
    console.error("❌ Erro ao carregar modelo:", error);
  }
}

// Uso
const container = document.getElementById("viewer-container");
const forgeViewer = new ForgeViewer(container);
forgeViewer.initialize();
```

## 📱 Estados da API

| Status       | Descrição                                  |
| ------------ | ------------------------------------------ |
| `ready`      | Modelo disponível para visualização        |
| `processing` | Modelo sendo processado (não implementado) |
| `error`      | Erro no modelo (não implementado)          |

## 🛠️ Tratamento de Erros

```javascript
async function safeApiCall(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro na API:", error.message);

    // Fallback para desenvolvimento
    if (url.includes("/api/model/urn")) {
      return {
        success: false,
        error: error.message,
        fallback: {
          message: "Usando modelo de exemplo",
          urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw",
        },
      };
    }

    throw error;
  }
}
```

## 🎨 Integração com React/Vue

### React Hook Exemplo:

```javascript
import { useState, useEffect } from "react";

function useForgeModel() {
  const [model, setModel] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadForgeData() {
      try {
        setLoading(true);

        // Carregar token e modelo em paralelo
        const [tokenResponse, modelResponse] = await Promise.all([
          fetch("http://localhost:8081/token"),
          fetch("http://localhost:8081/api/model/urn"),
        ]);

        const tokenData = await tokenResponse.json();
        const modelData = await modelResponse.json();

        setToken(tokenData);
        setModel(modelData.model);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadForgeData();
  }, []);

  return { model, token, loading, error };
}

// Componente React
function ForgeViewerComponent() {
  const { model, token, loading, error } = useForgeModel();

  if (loading) return <div>Carregando modelo...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2>🏗️ {model.name}</h2>
      <div id="forge-viewer" style={{ height: "500px" }}>
        {/* Forge Viewer será inicializado aqui */}
      </div>
    </div>
  );
}
```

## 🔄 Migração da API Complexa

Se você estava usando a versão anterior (67+ endpoints):

```javascript
// ❌ ANTIGO - Múltiplos endpoints
const models = await fetch("/api/models");
const validation = await fetch("/api/models/validate-urn");
const processing = await fetch("/api/processing/start");

// ✅ NOVO - Endpoint simplificado
const model = await fetch("/api/model/urn");
```

## 🏃‍♂️ Quick Start

1. **Iniciar API**: `npm run dev`
2. **Testar endpoints**:
   ```bash
   curl http://localhost:8081/
   curl http://localhost:8081/api/model/urn
   ```
3. **Integrar no frontend**: Use os exemplos acima

## 📋 Checklist de Integração

- [ ] API rodando em `http://localhost:8081`
- [ ] Endpoint `/api/model/urn` retornando URN válido
- [ ] Token endpoint `/token` funcionando
- [ ] Forge Viewer carregando modelo com sucesso
- [ ] Sistema de portas integrado (opcional)

---

**🎯 Modelo Principal**: BR6-CSFAIP.IFC  
**⚡ Status**: Funcional e Otimizada  
**📚 Baseado em**: MERN-Stack-Revit-Forge-Viewer
