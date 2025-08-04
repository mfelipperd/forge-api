# 🔒 Guia de Segurança - Autodesk Forge API

## ⚠️ **IMPORTANTE: Credenciais Comprometidas**

As credenciais do Autodesk Forge neste repositório foram **COMPROMETIDAS** e detectadas pelo GitGuardian. 

### 🚨 **Ações Imediatas Necessárias**

1. **Revogar credenciais atuais no painel da Autodesk:**
   - Acesse: https://aps.autodesk.com/developer/overview
   - Vá para seu aplicativo
   - Gere novas credenciais (Client ID e Client Secret)
   - Revogue as credenciais antigas

2. **Atualizar arquivo .env local:**
   ```bash
   cp .env.example .env
   # Edite .env com as NOVAS credenciais
   ```

3. **Verificar .gitignore:**
   ```bash
   # Confirme que .env está sendo ignorado
   cat .gitignore | grep .env
   ```

## 📋 **Credenciais Comprometidas (REVOGUE IMEDIATAMENTE)**

- **Client ID**: `wtEH7i4T3HCzsfL9N1BG8iZjEVvMUwNm1DJzRoeki7QtbVYA`
- **Client Secret**: `WsAtcTsJf5xlWFt0Wpr9BVpiMSBefmrtO19AsAmNxSn9269vgdezC8DWBEAGhz0y`

## 🛡️ **Melhores Práticas de Segurança**

### ✅ **O que fazer:**
- Sempre usar variáveis de ambiente para credenciais
- Manter arquivo `.env` fora do controle de versão
- Usar `.env.example` com valores placeholder
- Rotacionar credenciais regularmente
- Usar diferentes credenciais para dev/staging/prod

### ❌ **Nunca fazer:**
- Commitar arquivos `.env` com credenciais reais
- Hardcodar credenciais no código fonte
- Compartilhar credenciais via chat/email
- Usar mesmas credenciais em múltiplos ambientes

## 🔧 **Configuração Segura**

1. **Clone do repositório:**
   ```bash
   git clone <repo>
   cd forge-api
   ```

2. **Configurar ambiente:**
   ```bash
   cp .env.example .env
   # Editar .env com SUS credenciais (não committear!)
   ```

3. **Verificar configuração:**
   ```bash
   npm start
   # Deve mostrar "FORGE_CLIENT_ID: Definido"
   ```

## 🚨 **Em caso de comprometimento:**

1. Revogue credenciais imediatamente na Autodesk
2. Gere novas credenciais
3. Atualize todas as instâncias (dev/staging/prod)
4. Monitore uso das credenciais antigas
5. Documente o incidente

## 📞 **Contatos**

- **Security**: Revogue credenciais IMEDIATAMENTE
- **DevOps**: Atualize pipelines CI/CD com novas credenciais
- **Team**: Comunique mudança para todos os desenvolvedores
