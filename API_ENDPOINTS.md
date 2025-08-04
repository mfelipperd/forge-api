# 🚀 Forge API - Endpoints Rápidos

## 📡 Base URL: `http://localhost:8081`

### 🎯 **Endpoints Essenciais para Frontend**

| Método | Endpoint              | Descrição              | Status |
| ------ | --------------------- | ---------------------- | ------ |
| `GET`  | `/token`              | Token Autodesk Forge   | ✅     |
| `GET`  | `/api/models`         | Lista todos os modelos | ✅     |
| `GET`  | `/api/viewer-urn/:id` | URN válida para viewer | ⭐     |
| `GET`  | `/api/test`           | Teste de conectividade | ✅     |

### 🗃️ **Modelo Disponível**

```json
{
  "id": "688b9a77d0b9cb0d0808a8a8",
  "name": "Edifício BR6-CSFAIP",
  "fileName": "BR6-CSFAIP.IFC",
  "status": "success"
}
```

### 🔧 **Exemplo de Uso**

```javascript
// 1. Obter token
const token = await fetch("http://localhost:8081/token").then((r) => r.json());

// 2. Listar modelos
const models = await fetch("http://localhost:8081/api/models").then((r) =>
  r.json()
);

// 3. Obter URN válida
const modelId = "688b9a77d0b9cb0d0808a8a8";
const urnData = await fetch(
  `http://localhost:8081/api/viewer-urn/${modelId}`
).then((r) => r.json());

// 4. Usar no Forge Viewer
const validUrn = urnData.data.urn;
```

---

📋 **Documentação Completa**: Ver `API_DOCUMENTATION.md`
