# 📚 Documentação Completa da API - Forge Backend

## 🌐 Informações Gerais

**Base URL**: `http://localhost:8081`  
**Ambiente**: Desenvolvimento  
**Porta**: 8081  
**Database**: MongoDB (forge-viewer)  
**Autenticação**: Token Bearer (Autodesk Forge)

---

## 📋 Índice de Endpoints

### 🏗️ **Endpoints Principais**

- [Status e Saúde](#status-e-saúde)
- [Autenticação Forge](#autenticação-forge)
- [Modelos - Visualização](#modelos---visualização)

### 🗃️ **Gerenciamento de Modelos**

- [Listar Modelos](#listar-modelos)
- [Detalhes do Modelo](#detalhes-do-modelo)
- [Criar Modelo](#criar-modelo)
- [Atualizar Modelo](#atualizar-modelo)
- [Deletar Modelo](#deletar-modelo)
- [Status do Modelo](#status-do-modelo)
- [Propriedades do Modelo](#propriedades-do-modelo)
- [Sincronização](#sincronização)
- [Estatísticas](#estatísticas)
- [Admin - Marcar Sucesso](#admin---marcar-sucesso)

### 🔧 **Processamento de Modelos**

- [Obter URN](#obter-urn)
- [Traduzir Modelo](#traduzir-modelo)
- [Status da Tradução](#status-da-tradução)
- [Propriedades (Legacy)](#propriedades-legacy)
- [Analisar IFC](#analisar-ifc)

### 🚪 **Gerenciamento de Portas**

- [Listar Portas](#listar-portas)
- [Criar Porta](#criar-porta)
- [Criar Portas em Lote](#criar-portas-em-lote)
- [Deletar Porta](#deletar-porta)

---

## 🏗️ Status e Saúde

### **GET** `/`

**Descrição**: Informações gerais da API

**Request**: Nenhum parâmetro necessário

**Response**:

```json
{
  "message": "🚀 Forge API Server - URN Generation & Model Management",
  "version": "1.0.0",
  "endpoints": {
    "token": "/token",
    "doors": "/api/doors"
  }
}
```

### **GET** `/api/test`

**Descrição**: Endpoint de teste para verificar se a API está funcionando

**Request**: Nenhum parâmetro necessário

**Response**:

```json
{
  "message": "Teste funcionando!",
  "timestamp": "2025-07-31T19:29:41.176Z"
}
```

---

## 🔐 Autenticação Forge

### **GET** `/token`

**Descrição**: Obtém token de acesso do Autodesk Forge

**Request**: Nenhum parâmetro necessário

**Response**:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
  "token_type": "Bearer",
  "expires_in": 3599
}
```

**Códigos de Status**:

- `200`: Token obtido com sucesso
- `500`: Falha na autenticação

---

## 🎯 Modelos - Visualização

### **GET** `/api/viewer-urn/:id` ⭐ **RECOMENDADO**

**Descrição**: Obtém URN válida para visualização no Forge Viewer (remove URNs fake automaticamente)

**Parâmetros**:

- `id` (path): ID do modelo no banco de dados

**Request**:

```
GET /api/viewer-urn/688b9a77d0b9cb0d0808a8a8
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "688b9a77d0b9cb0d0808a8a8",
    "name": "Edifício BR6-CSFAIP",
    "fileName": "BR6-CSFAIP.IFC",
    "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw",
    "status": "success"
  }
}
```

**Códigos de Status**:

- `200`: URN obtida com sucesso
- `404`: Modelo não encontrado
- `500`: Erro interno do servidor

---

## 🗃️ Gerenciamento de Modelos

### **GET** `/api/models`

**Descrição**: Lista todos os modelos disponíveis

**Request**: Nenhum parâmetro necessário

**Response**:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "metadata": {
        "ifcTypes": [],
        "hasProperties": false
      },
      "_id": "688b9a77d0b9cb0d0808a8a8",
      "name": "Edifício BR6-CSFAIP",
      "fileName": "BR6-CSFAIP.IFC",
      "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw",
      "base64Urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw",
      "status": "success",
      "progress": "complete",
      "fileSize": 3200000,
      "fileType": "ifc",
      "description": "Modelo do edifício BR6-CSFAIP",
      "tags": ["br6", "csfaip", "edificio"],
      "uploadDate": "2025-07-31T16:31:51.726Z",
      "createdAt": "2025-07-31T16:31:51.726Z",
      "updatedAt": "2025-07-31T19:21:25.291Z",
      "__v": 0
    }
  ]
}
```

### **GET** `/api/models/:id`

**Descrição**: Obtém detalhes de um modelo específico

**Parâmetros**:

- `id` (path): ID do modelo

**Response**: Objeto do modelo (mesmo formato do array acima)

### **POST** `/api/models`

**Descrição**: Registra um novo modelo

**Request Body**:

```json
{
  "name": "Nome do Modelo",
  "fileName": "arquivo.ifc",
  "fileSize": 1024000,
  "fileType": "ifc",
  "description": "Descrição do modelo",
  "tags": ["tag1", "tag2"]
}
```

**Response**: Modelo criado (formato similar ao GET)

### **PUT** `/api/models/:id`

**Descrição**: Atualiza um modelo existente

**Parâmetros**:

- `id` (path): ID do modelo

**Request Body**: Campos a serem atualizados (parcial)

**Response**: Modelo atualizado

### **DELETE** `/api/models/:id`

**Descrição**: Remove um modelo

**Parâmetros**:

- `id` (path): ID do modelo

**Response**:

```json
{
  "success": true,
  "message": "Modelo deletado com sucesso"
}
```

### **GET** `/api/models/stats`

**Descrição**: Obtém estatísticas dos modelos

**Response**:

```json
{
  "total": 1,
  "byStatus": {
    "success": 1,
    "pending": 0,
    "error": 0
  },
  "byFileType": {
    "ifc": 1
  },
  "totalSize": 3200000
}
```

### **POST** `/api/models/sync`

**Descrição**: Sincroniza todos os modelos com o Forge

**Response**:

```json
{
  "success": true,
  "synchronized": 1,
  "message": "Sincronização concluída"
}
```

### **GET** `/api/models/:id/status`

**Descrição**: Obtém status de processamento de um modelo

**Parâmetros**:

- `id` (path): ID do modelo

**Response**:

```json
{
  "id": "688b9a77d0b9cb0d0808a8a8",
  "status": "success",
  "progress": "complete",
  "message": "Modelo processado com sucesso"
}
```

### **GET** `/api/models/:id/properties`

**Descrição**: Obtém propriedades de um modelo

**Parâmetros**:

- `id` (path): ID do modelo

**Response**:

```json
{
  "success": true,
  "properties": {
    "ifcTypes": [],
    "hasProperties": false,
    "metadata": {}
  }
}
```

### **POST** `/api/models/admin/mark-success`

**Descrição**: Marca modelos como processados com sucesso (Admin)

**Request Body**:

```json
{
  "modelIds": ["id1", "id2"],
  "status": "success"
}
```

**Response**:

```json
{
  "success": true,
  "updated": 2
}
```

---

## 🔧 Processamento de Modelos (Legacy)

### **GET** `/api/model/urn`

**Descrição**: Obtém URN de modelo (método legado)

**Response**: URN do modelo

### **POST** `/api/model/translate`

**Descrição**: Inicia tradução de modelo no Forge

**Request Body**:

```json
{
  "bucketKey": "bucket-name",
  "objectName": "model.ifc"
}
```

**Response**: Status da tradução iniciada

### **GET** `/api/model/:urn/status`

**Descrição**: Verifica status da tradução

**Parâmetros**:

- `urn` (path): URN do modelo (encoded)

**Response**: Status atual da tradução

### **GET** `/api/model/:urn/properties`

**Descrição**: Obtém propriedades do modelo (método legado)

**Parâmetros**:

- `urn` (path): URN do modelo (encoded)

### **GET** `/api/model/:urn/analyze`

**Descrição**: Analisa modelo IFC

**Parâmetros**:

- `urn` (path): URN do modelo (encoded)

**Response**: Análise detalhada do modelo IFC

---

## 🚪 Gerenciamento de Portas

### **GET** `/api/doors`

**Descrição**: Lista todas as portas

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "_id": "door_id",
      "mark": "P01",
      "finish": "Madeira",
      "familyType": "Porta Padrão",
      "properties": {},
      "createdAt": "2025-07-31T10:00:00Z"
    }
  ]
}
```

### **POST** `/api/doors/add`

**Descrição**: Cria uma nova porta

**Request Body**:

```json
{
  "mark": "P01",
  "finish": "Madeira",
  "familyType": "Porta Padrão",
  "properties": {}
}
```

### **POST** `/api/doors/batch`

**Descrição**: Cria múltiplas portas em lote

**Request Body**:

```json
{
  "doors": [
    {
      "mark": "P01",
      "finish": "Madeira",
      "familyType": "Porta Padrão"
    },
    {
      "mark": "P02",
      "finish": "Metal",
      "familyType": "Porta Industrial"
    }
  ]
}
```

### **DELETE** `/api/doors/delete`

**Descrição**: Remove uma porta

**Request Body**:

```json
{
  "id": "door_id"
}
```

---

## 🚨 Códigos de Status HTTP

| Código | Significado           | Descrição                  |
| ------ | --------------------- | -------------------------- |
| 200    | OK                    | Requisição bem-sucedida    |
| 201    | Created               | Recurso criado com sucesso |
| 400    | Bad Request           | Dados de entrada inválidos |
| 404    | Not Found             | Recurso não encontrado     |
| 500    | Internal Server Error | Erro interno do servidor   |

---

## 🔧 Headers Recomendados

```javascript
const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
};
```

---

## 🎯 Endpoints Mais Usados (Recomendados)

### **Para Frontend/Visualização**:

1. `GET /token` - Obter token Forge
2. `GET /api/models` - Listar modelos
3. `GET /api/viewer-urn/:id` - Obter URN válida ⭐

### **Para Gerenciamento**:

1. `GET /api/models/stats` - Estatísticas
2. `POST /api/models/sync` - Sincronizar
3. `GET /api/models/:id/status` - Status

### **Para Desenvolvimento**:

1. `GET /api/test` - Teste de conectividade
2. `GET /` - Informações da API

---

## 💡 Notas Importantes

- ⭐ **Use sempre** `/api/viewer-urn/:id` para obter URNs para o Forge Viewer
- 🔐 Token Forge expira em 3599 segundos (≈1 hora)
- 🗃️ Modelo atual disponível: "Edifício BR6-CSFAIP" (ID: `688b9a77d0b9cb0d0808a8a8`)
- 🚀 Sistema otimizado sem URNs fake - todas as URNs são válidas

**Status**: API totalmente funcional e documentada! ✅
