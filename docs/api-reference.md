# Forge API - Documentação

## Visão Geral

API para gerenciamento de modelos 3D usando Autodesk Forge, com suporte para arquivos IFC e manipulação de URNs.

**URL Base**: `http://localhost:8081`

## Formato de Respostas

### Sucesso

```json
{
  "success": true,
  "data": {
    // Dados específicos do endpoint
  }
}
```

### Erro

```json
{
  "success": false,
  "error": "Mensagem de erro",
  "details": "Detalhes adicionais (apenas em desenvolvimento)"
}
```

## Autenticação

### Obter Token do Forge

```http
GET /token
```

**Resposta**

```json
{
  "success": true,
  "data": {
    "access_token": "string",
    "token_type": "Bearer",
    "expires_in": 3599
  }
}
```

## Endpoints de Modelos

### Listar Todos os Modelos

```http
GET /api/models
```

**Query Parameters**

- `status` (opcional): Filtrar por status do modelo
- `tag` (opcional): Filtrar por tag
- `search` (opcional): Buscar em nome, fileName ou descrição

**Resposta**

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "_id": "string",
      "name": "string",
      "fileName": "string",
      "urn": "string",
      "base64Urn": "string",
      "status": "string",
      "progress": "string",
      "fileType": "string",
      "fileSize": 0,
      "description": "string",
      "tags": ["string"],
      "uploadDate": "date",
      "metadata": {}
    }
  ],
  "summary": {
    "regular": 5,
    "custom": 5,
    "total": 10
  }
}
```

### Obter Modelo Específico

```http
GET /api/models/:id
```

**Parâmetros**

- `id`: ID do modelo

**Resposta**

```json
{
  "success": true,
  "data": {
    "_id": "string",
    "name": "string",
    "fileName": "string",
    "urn": "string",
    "base64Urn": "string",
    "status": "string",
    "progress": "string",
    "fileType": "string",
    "fileSize": 0,
    "description": "string",
    "tags": ["string"],
    "uploadDate": "date",
    "metadata": {}
  }
}
```

### Registrar Novo Modelo

```http
POST /api/models
```

**Body**

```json
{
  "name": "string (required)",
  "fileName": "string (required)",
  "urn": "string (required)",
  "fileSize": "number (required)",
  "fileType": "string (required)",
  "description": "string (optional)",
  "tags": ["string"] (optional)
}
```

**Resposta**

```json
{
  "success": true,
  "message": "Modelo registrado com sucesso",
  "data": {
    // Dados do modelo criado
  }
}
```

### Adicionar URN Manual

```http
POST /api/models/upload-urn
```

**Body**

```json
{
  "name": "string (required)",
  "urn": "string (required)",
  "fileName": "string (optional)",
  "description": "string (optional)",
  "metadata": {} (optional)
}
```

**Resposta**

```json
{
  "success": true,
  "message": "URN adicionada com sucesso",
  "data": {
    "id": "string",
    "name": "string",
    "fileName": "string",
    "urn": "string",
    "description": "string",
    "status": "string",
    "uploadDate": "date"
  }
}
```

## Upload e Processamento IFC

### Upload de Arquivo IFC

```http
POST /api/models/ifc/upload
Content-Type: multipart/form-data
```

**Form Fields**

- `ifcFile`: Arquivo .ifc (required)
- `name`: Nome do modelo (required)
- `description`: Descrição do modelo (optional)

**Resposta**

```json
{
  "success": true,
  "message": "Upload iniciado com sucesso",
  "data": {
    "id": "string",
    "name": "string",
    "status": "uploading",
    "uploadDate": "date"
  }
}
```

### Verificar Status do Upload

```http
GET /api/models/ifc/status/:id
```

**Parâmetros**

- `id`: ID do modelo

**Resposta**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "string",
    "progress": "string",
    "message": "string",
    "urn": "string (quando concluído)"
  }
}
```

## Visualização

### Obter URN Válida

```http
GET /api/viewer-urn/:id
```

**Parâmetros**

- `id`: ID do modelo

**Resposta**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "fileName": "string",
    "urn": "string",
    "status": "string"
  }
}
```

## Status da API

### Verificar Status

```http
GET /api/test
```

**Resposta**

```json
{
  "success": true,
  "data": {
    "message": "API funcionando",
    "timestamp": "date"
  }
}
```

## Códigos de Status

- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Erro de validação/requisição inválida
- `401`: Não autorizado
- `404`: Recurso não encontrado
- `409`: Conflito (ex: URN já existe)
- `500`: Erro interno do servidor

## Observações

1. Todos os endpoints que podem falhar incluem tratamento de erros padronizado
2. Timestamps são retornados no formato ISO 8601
3. URNs são sempre validadas antes de serem processadas
4. Em ambiente de desenvolvimento, erros incluem mais detalhes
5. O campo `status` pode ter os seguintes valores:
   - `pending`: Aguardando processamento
   - `uploading`: Upload em andamento
   - `processing`: Processando no Forge
   - `success`: Concluído com sucesso
   - `error`: Erro no processamento
