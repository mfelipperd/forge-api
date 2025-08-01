# 🚀 Upload Automático de Arquivos IFC - Guia Completo

> **Nova funcionalidade**: Upload direto de arquivos .ifc com processamento automático para extrair URN

## 📋 Visão Geral

Esta nova funcionalidade automatiza completamente o processo de:
1. **Upload** do arquivo .ifc
2. **Criação** automática de bucket no Autodesk OSS
3. **Tradução** automática via Model Derivative API
4. **Geração** automática da URN para visualização
5. **Monitoramento** do progresso em background

**🎯 Objetivo**: Eliminar a dependência do VS Code Extension e automatizar todo o pipeline.

## 🛠️ Endpoint Principal

### **POST** `/api/models/ifc/upload`

Upload e processamento automático de arquivo IFC.

**Content-Type**: `multipart/form-data`

**Campos do Form**:
- `ifcFile` (obrigatório): Arquivo .ifc
- `name` (obrigatório): Nome do modelo
- `description` (opcional): Descrição do modelo

## 📝 Exemplos de Use

### 1. **Upload via cURL**

```bash
curl -X POST http://localhost:8081/api/models/ifc/upload \
  -F "ifcFile=@/caminho/para/arquivo.ifc" \
  -F "name=Meu Modelo Arquitetônico" \
  -F "description=Modelo de teste com processamento automático"
```

### 2. **Upload via JavaScript (Frontend)**

```javascript
const uploadIFC = async (file, modelName, description = '') => {
  const formData = new FormData();
  formData.append('ifcFile', file);
  formData.append('name', modelName);
  formData.append('description', description);

  try {
    const response = await fetch('http://localhost:8081/api/models/ifc/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Upload iniciado:', result.model);
      console.log('🔄 URN gerada:', result.model.urn);
      console.log('📊 Acompanhar em:', result.nextSteps.checkStatus);
      
      // Monitorar progresso
      monitorProgress(result.model.id);
    } else {
      console.error('❌ Erro no upload:', result.error);
    }
  } catch (error) {
    console.error('❌ Erro de rede:', error);
  }
};

// Função para monitorar progresso
const monitorProgress = async (modelId) => {
  const checkStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8081/api/models/ifc/status/${modelId}`);
      const status = await response.json();
      
      console.log(`📊 Status: ${status.model.status} (${status.model.progress})`);
      
      if (status.model.status === 'success') {
        console.log('🎉 Processamento concluído! Modelo pronto para visualização.');
        return;
      }
      
      if (status.model.status === 'failed') {
        console.log('❌ Processamento falhou.');
        return;
      }
      
      // Continuar monitorando
      setTimeout(checkStatus, 5000);
      
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
    }
  };
  
  checkStatus();
};
```

### 3. **Upload via HTML Form**

```html
<!DOCTYPE html>
<html>
<head>
  <title>Upload IFC Automático</title>
</head>
<body>
  <h1>🚀 Upload Automático de Arquivo IFC</h1>
  
  <form id="uploadForm" enctype="multipart/form-data">
    <div>
      <label>Arquivo IFC:</label>
      <input type="file" name="ifcFile" accept=".ifc" required>
    </div>
    
    <div>
      <label>Nome do Modelo:</label>
      <input type="text" name="name" required>
    </div>
    
    <div>
      <label>Descrição:</label>
      <textarea name="description"></textarea>
    </div>
    
    <button type="submit">🚀 Fazer Upload e Processar</button>
  </form>

  <div id="progress" style="display: none;">
    <h3>📊 Progresso do Processamento</h3>
    <div id="status"></div>
  </div>

  <script>
    document.getElementById('uploadForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const progressDiv = document.getElementById('progress');
      const statusDiv = document.getElementById('status');
      
      try {
        progressDiv.style.display = 'block';
        statusDiv.innerHTML = '🔄 Fazendo upload...';
        
        const response = await fetch('http://localhost:8081/api/models/ifc/upload', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
          statusDiv.innerHTML = `✅ Upload concluído! URN: ${result.model.urn}<br>🔄 Processando...`;
          
          // Monitorar progresso
          const monitorInterval = setInterval(async () => {
            try {
              const statusResponse = await fetch(`http://localhost:8081/api/models/ifc/status/${result.model.id}`);
              const statusData = await statusResponse.json();
              
              statusDiv.innerHTML = `📊 Status: ${statusData.model.status} (${statusData.model.progress})`;
              
              if (statusData.model.status === 'success') {
                statusDiv.innerHTML += '<br>🎉 Processamento concluído! Modelo pronto para visualização.';
                clearInterval(monitorInterval);
              }
              
              if (statusData.model.status === 'failed') {
                statusDiv.innerHTML += '<br>❌ Processamento falhou.';
                clearInterval(monitorInterval);
              }
              
            } catch (error) {
              console.error('Erro ao verificar status:', error);
            }
          }, 3000);
          
        } else {
          statusDiv.innerHTML = `❌ Erro: ${result.error}`;
        }
        
      } catch (error) {
        statusDiv.innerHTML = `❌ Erro de conexão: ${error.message}`;
      }
    });
  </script>
</body>
</html>
```

## 📊 Monitoramento de Status

### **GET** `/api/models/ifc/status/:id`

Verifica o status de processamento de um upload.

**Resposta**:
```json
{
  "success": true,
  "model": {
    "id": "modelo_id",
    "name": "Nome do Modelo",
    "fileName": "arquivo.ifc",
    "status": "translating",
    "progress": "50%",
    "fileSize": 2048000,
    "uploadedAt": "2025-01-01T12:00:00.000Z",
    "canVisualize": false
  },
  "forge": {
    "status": "inprogress",
    "progress": "50%",
    "lastCheck": "2025-01-01T12:05:00.000Z"
  }
}
```

## 🔄 Estados do Processamento

| Status | Descrição | Progresso | Visualizável |
|--------|-----------|-----------|-------------|
| `translating` | Processando no Forge | 0-99% | ❌ |
| `success` | Concluído com sucesso | 100% | ✅ |
| `failed` | Falhou no processamento | - | ❌ |

## ⚡ Características da Funcionalidade

### ✅ **Automações Incluídas**

- 🔄 **Bucket Management**: Criação automática de bucket temporário
- 📤 **Upload OSS**: Upload direto para Autodesk Object Storage Service
- 🔧 **Translation**: Início automático da tradução via Model Derivative
- 📊 **Monitoring**: Monitoramento automático do progresso em background
- 🧹 **Cleanup**: Limpeza automática de arquivos temporários
- 💾 **Database**: Persistência automática no MongoDB

### 🛡️ **Validações**

- ✅ Apenas arquivos `.ifc` aceitos
- ✅ Limite de 100MB por arquivo
- ✅ Verificação de duplicatas por nome
- ✅ Validação de campos obrigatórios

### 📈 **Monitoramento Background**

- 🕐 Verificação a cada 30 segundos
- ⏱️ Timeout após 15 minutos
- 🔄 Atualização automática do status no banco
- 📊 Progresso em tempo real

## 🌐 Integração com Sistema Existente

Esta funcionalidade é **complementar** ao sistema atual:

- ✅ **Preserva** todas as rotas existentes
- ✅ **Mantém** compatibilidade com URNs manuais
- ✅ **Adiciona** nova opção de upload automático
- ✅ **Usa** mesma estrutura de banco de dados

## 🔧 Configuração Necessária

### 1. **Variáveis de Ambiente**

```env
FORGE_CLIENT_ID=seu_client_id
FORGE_CLIENT_SECRET=seu_client_secret
```

### 2. **Dependências**

```bash
npm install multer @types/multer form-data
```

### 3. **Diretórios**

```bash
mkdir -p uploads/temp
```

## 🚨 Troubleshooting

### **Erro: "Apenas arquivos .ifc são permitidos"**
- Verifique se o arquivo tem extensão `.ifc`
- Certifique-se de que o `Content-Type` está correto

### **Erro: "Erro ao criar bucket"**
- Verifique as credenciais Forge
- Confirme que o `FORGE_CLIENT_ID` é válido

### **Status: "failed"**
- Arquivo pode estar corrompido
- Verifique se é um arquivo IFC válido
- Tente com arquivo menor

### **Upload lento**
- Arquivos grandes (>50MB) demoram mais
- Verifique sua conexão de internet
- Considere compactar o arquivo IFC

## 📚 Exemplos Práticos

### **Upload simples via JavaScript**

```javascript
const input = document.querySelector('input[type="file"]');
const file = input.files[0];

const formData = new FormData();
formData.append('ifcFile', file);
formData.append('name', 'Meu Projeto');

fetch('/api/models/ifc/upload', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => {
  console.log('URN gerada:', data.model.urn);
});
```

### **Verificação de status**

```javascript
const checkStatus = async (modelId) => {
  const response = await fetch(`/api/models/ifc/status/${modelId}`);
  const data = await response.json();
  
  return {
    isReady: data.model.canVisualize,
    progress: data.model.progress,
    urn: data.model.urn
  };
};
```

---

## 🎯 Próximos Passos

Após implementar esta funcionalidade, considere:

1. **Interface Web**: Criar uma interface amigável para upload
2. **Batch Upload**: Permitir múltiplos arquivos
3. **Notificações**: WebSockets para notificações em tempo real
4. **Histórico**: Dashboard de uploads realizados
5. **Análise**: Extração automática de metadados IFC

---

**💡 Esta funcionalidade torna sua API Forge completamente autônoma para processamento de arquivos IFC!**
