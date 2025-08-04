# 🔄 Migração para API Simplificada

## Comparação: Antes vs Depois

### ❌ VERSÃO ATUAL (Complexa)

- **67+ endpoints** documentados
- Sistema completo de validação de URN
- Múltiplas rotas de processamento
- Sistema de fake URN detection
- Múltiplos modelos no banco

### ✅ VERSÃO SIMPLIFICADA (Otimizada)

- **5 endpoints essenciais**
- URN fixo extraído do manifest real
- Baseado no padrão original MERN-Stack-Revit-Forge-Viewer
- Foco na funcionalidade principal

## 🚀 Como Migrar

### 1. Fazer Backup do Servidor Atual

```bash
# O servidor atual foi mantido como server.ts
# O novo servidor está em server-simplified.ts
```

### 2. Configurar package.json

Adicione script para a versão simplificada:

```json
{
  "scripts": {
    "start": "node dist/server-simplified.js",
    "dev": "nodemon src/server-simplified.ts",
    "dev-complex": "nodemon src/server.ts"
  }
}
```

### 3. Testar a Nova API

```bash
# Testar status
curl http://localhost:8081/

# Testar token
curl http://localhost:8081/token

# Testar modelo principal
curl http://localhost:8081/api/model/urn
```

## 📊 Endpoints da Versão Simplificada

| Endpoint                     | Método | Função               |
| ---------------------------- | ------ | -------------------- |
| `/`                          | GET    | Status da API        |
| `/token`                     | GET    | Token Autodesk Forge |
| `/api/model/urn`             | GET    | **URN Principal** ⭐ |
| `/api/model/:urn/properties` | GET    | Propriedades IFC     |
| `/api/doors/*`               | CRUD   | Sistema de portas    |

## 🎯 Benefícios da Simplificação

1. **Manutenibilidade**: Código mais limpo e focado
2. **Performance**: Menos overhead e validações desnecessárias
3. **Portfolio**: Demonstração clara da integração Forge
4. **Original**: Baseado no padrão do repositório de referência
5. **Estabilidade**: URN fixo eliminando problemas de validação

## 🔧 Próximos Passos

1. ✅ Servidor simplificado criado
2. ⏳ Atualizar package.json
3. ⏳ Testar integração com frontend
4. ⏳ Documentar a nova API
5. ⏳ Opcional: Remover servidor complexo

## 💡 Observações

- O servidor atual permanece como `server.ts` (backup)
- A nova versão está em `server-simplified.ts`
- URN principal: `dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6Zm9yZ2Utdmlld2VyLW1vZGVscy9CUjYtQ1NGQUlQLklGQw`
- Modelo: BR6-CSFAIP.IFC (validado e funcional)
