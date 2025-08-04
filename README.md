# 🚀 Forge API Backend - Versão Estável

> **API Node.js/Express/TypeScript para integração com Autodesk Forge**  
> Versão funcional e otimizada para gerenciamento de modelos 3D e URNs

## 📋 Sobre o Projeto

Esta é uma API backend completa baseada no padrão MERN-Stack-Revit-Forge-Viewer, otimizada e simplificada para uso em produção.

### ✅ Status: **FUNCIONAL E TESTADA**

- ✅ Autenticação Autodesk Forge
- ✅ Gerenciamento de modelos 3D
- ✅ Sistema de URNs personalizada via POST
- ✅ Validação e limpeza de dados
- ✅ MongoDB integrado
- ✅ TypeScript + Express
- ✅ Sistema CRUD completo

## 🛠️ Tecnologias

- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: MongoDB + Mongoose
- **API Externa**: Autodesk Forge Platform Services
- **Validação**: Custom validators para URN
- **Documentação**: Swagger/OpenAPI ready

## 📂 Estrutura do Projeto

```
forge-api/
├── src/
│   ├── controllers/          # Lógica de negócio
│   ├── models/              # Schemas MongoDB
│   ├── routes/              # Definição das rotas
│   ├── services/            # Integração Forge
│   └── server-simplified.ts # Servidor principal
├── clean-database.js        # Script de limpeza DB
├── list-models.js          # Utilitário de listagem
└── POST_URN_GUIDE.md       # Guia da rota POST
```

## 🚀 Instalação e Uso

### 1. **Configuração Inicial**

```bash
# Clonar repositório
git clone <url-do-repositorio>
cd forge-api

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais Forge
```

### 2. **Variáveis de Ambiente (.env)**

```env
FORGE_CLIENT_ID=seu_client_id_aqui
FORGE_CLIENT_SECRET=seu_client_secret_aqui
FORGE_CALLBACK_URL=http://localhost:8081/callback
MONGO_URI=mongodb://localhost:27017/forge-api
NODE_ENV=development
PORT=8081
```

### 3. **Iniciar Servidor**

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

### 4. **Preparar Banco de Dados**

```bash
# Limpar e popular com dados válidos
node clean-database.js

# Listar modelos atual
node list-models.js
```

## 📡 Endpoints Principais

### **🔐 Autenticação**

- `GET /token` - Obter token Autodesk Forge

### **📦 Modelos Principais**

- `GET /api/model/urn` - URN do modelo principal
- `GET /api/model/:urn/properties` - Propriedades IFC

### **🆕 Sistema POST URN** (Nova funcionalidade)

- `POST /api/models/upload-urn` - Adicionar URN personalizada
- `GET /api/models/custom` - Listar modelos personalizados
- `GET /api/models/custom/:id` - Obter modelo específico
- `DELETE /api/models/custom/:id` - Deletar modelo personalizado

### **🚪 Sistema de Portas**

- `GET /api/doors` - Listar portas
- `POST /api/doors` - Criar porta
- `PUT /api/doors/:id` - Atualizar porta
- `DELETE /api/doors/:id` - Deletar porta

## 💡 Funcionalidades Destacadas

### ✨ **Sistema POST URN Personalizada**

```javascript
// Adicionar nova URN via POST
const response = await fetch("http://localhost:8081/api/models/upload-urn", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Meu Modelo",
    urn: "dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6...",
    description: "Descrição do modelo",
  }),
});
```

### 🔄 **Validação Automática de URN**

- Validação de formato base64
- Verificação de duplicatas
- Status de processamento automático

### 🧹 **Scripts de Manutenção**

- `clean-database.js` - Limpa e restaura dados válidos
- `list-models.js` - Lista todos os modelos
- Sistema de backup automático

## 🔧 Comandos Úteis

```bash
# Verificar status da API
curl http://localhost:8081/

# Testar token Forge
curl http://localhost:8081/token

# Listar modelos personalizados
curl http://localhost:8081/api/models/custom

# Limpar banco e restaurar dados válidos
node clean-database.js
```

## 📝 Logs e Debug

A API possui sistema de logs detalhado:

```
🚀 ===== FORGE API SIMPLIFICADA =====
📍 Servidor: http://localhost:8081
🎯 Modelo: BR6-CSFAIP.IFC
🔥 Status: Funcional e Otimizada
✅ Conectado ao banco de dados!
```

## 🔄 Versionamento

Esta é uma **versão estável** da API. Para futuras inovações:

1. **Criar branch**: `git checkout -b feature/nova-funcionalidade`
2. **Testar mudanças**: `npm test`
3. **Merge seguro**: Sempre manter main funcional

## 🚨 Troubleshooting

### Problema: Porta 8081 em uso

```bash
npx kill-port 8081
npm run dev
```

### Problema: MongoDB connection

```bash
# Verificar se MongoDB está rodando
mongosh --eval "db.runCommand({connectionStatus : 1})"
```

### Problema: URN inválida

```bash
node clean-database.js  # Restaura URNs válidas
```

## 📚 Documentação Adicional

- 📖 [Guia POST URN](./POST_URN_GUIDE.md)
- 📖 [Documentação API Completa](./API_DOCUMENTATION.md)
- 📖 [Guia de Integração Frontend](./FRONTEND_INTEGRATION.md)

## 🎯 Próximos Passos

- [ ] Testes automatizados
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] API rate limiting
- [ ] Swagger UI integrado

---

**💡 Esta versão está funcional e pronta para produção!**  
_Mantenha esta versão como backup antes de implementar novas funcionalidades._
