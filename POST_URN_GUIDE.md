# 📤 Guia Completo: Rota POST para Envio de URN

## 🎯 Implementação Concluída

✅ **Rota POST criada**: `/api/models/upload-urn`  
✅ **Modelo de dados**: `CustomModel` com validações  
✅ **Sistema completo**: CRUD para modelos personalizados  
✅ **Validações**: URN base64, duplicatas, campos obrigatórios  

---

## 📋 Endpoint Principal

### **POST** `/api/models/upload-urn`
Adiciona uma nova URN de modelo personalizada ao sistema.

#### **Corpo da Requisição:**
```json
{
  "name": "Nome do Modelo", // OBRIGATÓRIO
  "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6...", // OBRIGATÓRIO (base64)
  "fileName": "modelo.ifc", // OPCIONAL
  "description": "Descrição do modelo", // OPCIONAL
  "metadata": { // OPCIONAL
    "fileSize": 2048000,
    "software": "Autodesk Revit",
    "version": "2024"
  }
}
```

#### **Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "URN adicionada com sucesso",
  "model": {
    "id": "uuid-gerado-automaticamente",
    "name": "Nome do Modelo",
    "fileName": "modelo.ifc",
    "urn": "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6...",
    "description": "Descrição do modelo",
    "status": "processing", // Muda para "ready" em ~2 segundos
    "uploadedAt": "2025-07-31T..."
  }
}
```

---

## 🚀 Como Usar no Frontend

### 1. **JavaScript Vanilla (Fetch API)**

```javascript
async function enviarURN() {
  const dadosModelo = {
    name: "Edifício Residencial XYZ",
    urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9tb2RlbG8taWZj",
    fileName: "edificio-xyz.ifc",
    description: "Modelo BIM do projeto residencial XYZ",
    metadata: {
      fileSize: 15728640,
      software: "Autodesk Revit",
      version: "2024"
    }
  };

  try {
    const response = await fetch('http://localhost:8081/api/models/upload-urn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dadosModelo)
    });

    const resultado = await response.json();

    if (resultado.success) {
      console.log('✅ URN enviada com sucesso!', resultado.model);
      alert(`Modelo "${resultado.model.name}" adicionado com ID: ${resultado.model.id}`);
    } else {
      console.error('❌ Erro:', resultado.error);
      alert('Erro: ' + resultado.error);
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    alert('Erro de conexão: ' + error.message);
  }
}

// Chamar a função
enviarURN();
```

### 2. **Formulário HTML Completo**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enviar URN - Forge API</title>
    <style>
        .container { max-width: 600px; margin: 50px auto; padding: 20px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .resultado { margin-top: 20px; padding: 15px; border-radius: 4px; }
        .sucesso { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .erro { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Enviar URN do Modelo</h1>
        
        <form id="formURN">
            <div class="form-group">
                <label for="name">Nome do Modelo *</label>
                <input type="text" id="name" name="name" required 
                       placeholder="Ex: Edifício Comercial ABC">
            </div>

            <div class="form-group">
                <label for="urn">URN do Modelo *</label>
                <textarea id="urn" name="urn" rows="3" required 
                          placeholder="dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6..."></textarea>
            </div>

            <div class="form-group">
                <label for="fileName">Nome do Arquivo</label>
                <input type="text" id="fileName" name="fileName" 
                       placeholder="Ex: modelo.ifc">
            </div>

            <div class="form-group">
                <label for="description">Descrição</label>
                <textarea id="description" name="description" rows="2" 
                          placeholder="Descrição do modelo BIM"></textarea>
            </div>

            <div class="form-group">
                <label for="software">Software</label>
                <input type="text" id="software" name="software" 
                       placeholder="Ex: Autodesk Revit">
            </div>

            <div class="form-group">
                <label for="version">Versão</label>
                <input type="text" id="version" name="version" 
                       placeholder="Ex: 2024">
            </div>

            <button type="submit">📤 Enviar URN</button>
        </form>

        <div id="resultado"></div>
    </div>

    <script>
        document.getElementById('formURN').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const resultadoDiv = document.getElementById('resultado');
            resultadoDiv.innerHTML = '<p>⏳ Enviando URN...</p>';

            // Coletar dados do formulário
            const formData = new FormData(e.target);
            const dadosModelo = {
                name: formData.get('name'),
                urn: formData.get('urn'),
                fileName: formData.get('fileName') || undefined,
                description: formData.get('description') || undefined,
                metadata: {}
            };

            // Adicionar metadata se fornecida
            if (formData.get('software')) {
                dadosModelo.metadata.software = formData.get('software');
            }
            if (formData.get('version')) {
                dadosModelo.metadata.version = formData.get('version');
            }

            try {
                const response = await fetch('http://localhost:8081/api/models/upload-urn', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dadosModelo)
                });

                const resultado = await response.json();

                if (resultado.success) {
                    resultadoDiv.innerHTML = `
                        <div class="resultado sucesso">
                            <h3>✅ URN Enviada com Sucesso!</h3>
                            <p><strong>ID:</strong> ${resultado.model.id}</p>
                            <p><strong>Nome:</strong> ${resultado.model.name}</p>
                            <p><strong>Status:</strong> ${resultado.model.status}</p>
                            <p><strong>Data:</strong> ${new Date(resultado.model.uploadedAt).toLocaleString('pt-BR')}</p>
                        </div>
                    `;
                    // Limpar formulário
                    e.target.reset();
                } else {
                    throw new Error(resultado.error);
                }

            } catch (error) {
                resultadoDiv.innerHTML = `
                    <div class="resultado erro">
                        <h3>❌ Erro ao Enviar URN</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        });
    </script>
</body>
</html>
```

### 3. **React Hook Personalizado**

```javascript
import { useState } from 'react';

function useEnviarURN() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sucesso, setSucesso] = useState(null);

  const enviarURN = async (dadosModelo) => {
    setLoading(true);
    setError(null);
    setSucesso(null);

    try {
      const response = await fetch('http://localhost:8081/api/models/upload-urn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosModelo)
      });

      const resultado = await response.json();

      if (resultado.success) {
        setSucesso(resultado.model);
        return resultado.model;
      } else {
        throw new Error(resultado.error);
      }

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { enviarURN, loading, error, sucesso };
}

// Componente React
function FormularioURN() {
  const { enviarURN, loading, error, sucesso } = useEnviarURN();
  const [formData, setFormData] = useState({
    name: '',
    urn: '',
    fileName: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await enviarURN(formData);
      setFormData({ name: '', urn: '', fileName: '', description: '' });
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome do Modelo"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        required
      />
      
      <textarea
        placeholder="URN do Modelo"
        value={formData.urn}
        onChange={(e) => setFormData({...formData, urn: e.target.value})}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? '⏳ Enviando...' : '📤 Enviar URN'}
      </button>

      {error && <div style={{color: 'red'}}>❌ {error}</div>}
      {sucesso && <div style={{color: 'green'}}>✅ URN enviada: {sucesso.name}</div>}
    </form>
  );
}
```

---

## 🔍 Endpoints Adicionais Criados

### **GET** `/api/models/custom`
Lista todos os modelos personalizados:
```javascript
const response = await fetch('http://localhost:8081/api/models/custom');
const { models } = await response.json();
console.log('Modelos:', models);
```

### **GET** `/api/models/custom/:id`
Obter modelo específico:
```javascript
const response = await fetch(`http://localhost:8081/api/models/custom/${modelId}`);
const { model } = await response.json();
console.log('Modelo:', model);
```

### **DELETE** `/api/models/custom/:id`
Remover modelo:
```javascript
const response = await fetch(`http://localhost:8081/api/models/custom/${modelId}`, {
  method: 'DELETE'
});
const resultado = await response.json();
console.log('Removido:', resultado.deletedModel);
```

---

## ⚠️ Validações e Tratamento de Erros

### **Campos Obrigatórios:**
- `name`: Nome do modelo
- `urn`: URN em formato base64

### **Validações:**
- URN deve ser base64 válido (mín. 10 caracteres)
- URN não pode ser duplicada
- Nome é obrigatório e não pode estar vazio

### **Códigos de Erro:**
- `400`: Dados inválidos ou campos obrigatórios faltando
- `409`: URN já existe no sistema
- `500`: Erro interno do servidor

### **Exemplo de Tratamento:**
```javascript
try {
  const response = await fetch('/api/models/upload-urn', { /* ... */ });
  const resultado = await response.json();
  
  if (!response.ok) {
    if (response.status === 409) {
      alert('Esta URN já existe no sistema!');
    } else if (response.status === 400) {
      alert('Dados inválidos: ' + resultado.error);
    } else {
      alert('Erro do servidor: ' + resultado.error);
    }
    return;
  }
  
  console.log('Sucesso!', resultado.model);
} catch (error) {
  alert('Erro de conexão: ' + error.message);
}
```

---

## 🎯 Resumo de Uso

1. **Prepare os dados** com `name` e `urn` obrigatórios
2. **Faça POST** para `/api/models/upload-urn`
3. **Trate as respostas** (sucesso 201, erros 400/409/500)
4. **Use o ID retornado** para futuras referências
5. **Monitor o status** ("processing" → "ready" em ~2s)

**A implementação está completa e pronta para uso!** 🚀
