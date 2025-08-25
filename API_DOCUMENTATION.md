# Forge API - Documentação Completa

## 📋 Visão Geral

A **Forge API** é um backend Node.js/Express.js que integra com a plataforma **Autodesk Platform Services (APS)** para processamento e visualização de arquivos IFC (Industry Foundation Classes). A API permite upload, processamento automático e gerenciamento de modelos 3D para visualização no Forge Viewer.

**Versão:** 2.0.0  
**Framework:** Express.js  
**Banco de Dados:** MongoDB (Mongoose)  
**Porta Padrão:** 8081

---

## 🚀 Funcionalidades Principais

- ✅ **Upload e Processamento IFC**: Processamento automático de arquivos .ifc
- ✅ **Autenticação APS**: Gerenciamento de tokens para Forge Viewer
- ✅ **Gerenciamento de Modelos**: CRUD completo de modelos 3D
- ✅ **Visualização**: Endpoints para integração com frontend
- ✅ **Monitoramento**: Acompanhamento de status de processamento

---

## 🔑 APIs Externas Utilizadas

### 1. **Autodesk Platform Services (APS)**
- **Autenticação**: `@aps_sdk/authentication`
- **Object Storage Service (OSS)**: `@aps_sdk/oss`
- **Model Derivative Service**: `@aps_sdk/model-derivative`

### 2. **Endpoints APS Utilizados**
- **Token**: `https://developer.api.autodesk.com/authentication/v2/token`
- **OSS**: `https://developer.api.autodesk.com/oss/v2`
- **Model Derivative**: `https://developer.api.autodesk.com/modelderivative/v2`

---

## 📡 Endpoints da API

### 🔴 **ENDPOINTS ESTRITAMENTE NECESSÁRIOS**

#### 1. **Token de Autenticação** - `GET /token`
**Descrição:** Endpoint essencial para o Forge Viewer funcionar  
**Resposta:**
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3599
}
```

#### 2. **Upload IFC** - `POST /api/models/ifc/upload`
**Descrição:** Upload e processamento automático de arquivos IFC  
**Content-Type:** `multipart/form-data`  
**Campos:**
- `ifcFile`: arquivo .ifc (obrigatório)
- `name`: nome do modelo (obrigatório)
- `description`: descrição (opcional)

**Resposta:**
```json
{
  "success": true,
  "message": "Arquivo IFC enviado e processamento iniciado",
  "data": {
    "modelId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Modelo IFC",
    "status": "uploaded",
    "progress": "0%"
  }
}
```

#### 3. **Status do Processamento** - `GET /api/models/ifc/status/:id`
**Descrição:** Verificar progresso do processamento IFC  
**Resposta:**
```json
{
  "success": true,
  "data": {
    "modelId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "status": "success",
    "progress": "100%",
    "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6..."
  }
}
```

#### 4. **URN para Viewer** - `GET /api/viewer-urn/:id`
**Descrição:** Endpoint essencial para o frontend exibir o modelo  
**Resposta:**
```json
{
  "success": true,
  "data": {
    "modelId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6...",
    "name": "Modelo IFC",
    "fileName": "modelo.ifc",
    "status": "success",
    "canVisualize": true
  }
}
```

---

### 🟡 **ENDPOINTS OPCIONAIS**

#### 5. **Listar Modelos** - `GET /api/models`
**Descrição:** Listar todos os modelos cadastrados  
**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Modelo IFC",
      "fileName": "modelo.ifc",
      "status": "success",
      "uploadDate": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### 6. **Obter Modelo por ID** - `GET /api/models/:id`
**Descrição:** Buscar modelo específico por ID  
**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Modelo IFC",
    "fileName": "modelo.ifc",
    "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6...",
    "status": "success",
    "uploadDate": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 7. **Registrar Modelo Manual** - `POST /api/models`
**Descrição:** Cadastrar modelo com URN existente  
**Body:**
```json
{
  "name": "Nome do Modelo",
  "fileName": "arquivo.ifc",
  "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6...",
  "description": "Descrição opcional"
}
```

#### 8. **Upload URN Manual** - `POST /api/models/upload-urn`
**Descrição:** Adicionar URN de modelo já processado  
**Body:**
```json
{
  "name": "Nome do Modelo",
  "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6...",
  "fileName": "arquivo.ifc",
  "description": "Descrição opcional"
}
```

#### 9. **Atualizar Modelo** - `PUT /api/models/:id`
**Descrição:** Modificar dados de modelo existente  
**Body:**
```json
{
  "name": "Novo Nome",
  "description": "Nova descrição"
}
```

#### 10. **Deletar Modelo** - `DELETE /api/models/:id`
**Descrição:** Remover modelo do sistema

#### 11. **Status do Modelo** - `GET /api/models/:id/status`
**Descrição:** Verificar status específico de modelo

#### 12. **Propriedades do Modelo** - `GET /api/models/:id/properties`
**Descrição:** Obter propriedades técnicas do modelo

---

### 🟢 **ENDPOINTS DE TESTE E DEBUG**

#### 13. **Teste da API** - `GET /api/test`
**Descrição:** Verificar se a API está funcionando

#### 14. **Debug de Variáveis** - `GET /api/debug-env`
**Descrição:** Verificar configuração de variáveis de ambiente

#### 15. **Teste de Credenciais** - `GET /api/test-forge-credentials`
**Descrição:** Validar credenciais do Forge/APS

---

## 🔧 Configuração e Variáveis de Ambiente

### **Arquivo `.env`**
```env
# Credenciais APS/Forge (OBRIGATÓRIAS)
FORGE_CLIENT_ID=seu_client_id_aqui
FORGE_CLIENT_SECRET=seu_client_secret_aqui

# Configurações do Servidor
PORT=8081
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/forge-api
```

---

## 📊 Fluxo de Processamento IFC

### 1. **Upload do Arquivo**
```
Frontend → POST /api/models/ifc/upload → API
```

### 2. **Processamento Automático**
```
API → APS OSS → Bucket → Model Derivative → Tradução
```

### 3. **Monitoramento**
```
Frontend → GET /api/models/ifc/status/:id → Status em tempo real
```

### 4. **Visualização**
```
Frontend → GET /token → GET /api/viewer-urn/:id → Forge Viewer
```

---

## 🚀 Como Executar

### **Desenvolvimento**
```bash
npm run dev:complex
```

### **Produção**
```bash
npm run build
npm run start:complex
```

---

## 📚 Dependências Principais

- **Express.js**: Framework web
- **Mongoose**: ODM para MongoDB
- **Multer**: Middleware para upload de arquivos
- **APS SDK**: SDKs oficiais da Autodesk
- **Axios**: Cliente HTTP
- **CORS**: Middleware para CORS
- **Dotenv**: Gerenciamento de variáveis de ambiente

---

## 🔍 Estrutura do Projeto

```
src/
├── controllers/          # Controladores da API
├── models/              # Modelos MongoDB
├── routes/              # Definição de rotas
├── services/            # Serviços de negócio
├── utils/               # Utilitários
└── server.ts            # Servidor principal
```

---

## ⚠️ Observações Importantes

1. **Credenciais APS**: São obrigatórias para funcionamento
2. **Processamento IFC**: Pode levar alguns minutos dependendo do tamanho
3. **Tokens**: Expiram em 1 hora (3600 segundos)
4. **MongoDB**: Deve estar rodando para persistência de dados
5. **Porta 8081**: Configurada como padrão para evitar conflitos

---

## 🆘 Troubleshooting

### **Erro 403 no Upload**
- Verificar credenciais APS
- Confirmar escopos de permissão

### **Erro de Conexão MongoDB**
- Verificar se o MongoDB está rodando
- Confirmar string de conexão

### **Token Expirado**
- O endpoint `/token` renova automaticamente
- Tokens são válidos por 1 hora

---

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Logs do servidor
2. Status das APIs APS
3. Configuração de variáveis de ambiente
4. Conectividade com MongoDB
