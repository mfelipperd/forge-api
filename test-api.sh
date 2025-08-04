#!/bin/bash

echo "🧪 Teste da API IFC Upload"
echo "=========================="

# Verificar se servidor está rodando
echo "1️⃣ Verificando servidor..."
curl -s http://localhost:8081/ > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Servidor está respondendo!"
else
    echo "❌ Servidor não está respondendo"
    echo "Tentando iniciar servidor..."
    npm run dev &
    sleep 10
fi

# Testar endpoint básico
echo ""
echo "2️⃣ Testando endpoint básico..."
RESPONSE=$(curl -s http://localhost:8081/)
if [[ "$RESPONSE" == *"Forge"* ]]; then
    echo "✅ Endpoint básico funcionando"
    echo "Resposta: $RESPONSE"
else
    echo "❌ Problema no endpoint básico"
    echo "Resposta: $RESPONSE"
fi

# Testar endpoint de token
echo ""
echo "3️⃣ Testando endpoint de token..."
TOKEN_RESPONSE=$(curl -s http://localhost:8081/token)
if [[ "$TOKEN_RESPONSE" == *"access_token"* ]]; then
    echo "✅ Token endpoint funcionando"
    echo "Token obtido com sucesso"
else
    echo "❌ Problema no token endpoint"
    echo "Resposta: $TOKEN_RESPONSE"
fi

# Testar upload IFC
echo ""
echo "4️⃣ Testando upload IFC..."
if [ -f "test-small.ifc" ]; then
    UPLOAD_RESPONSE=$(curl -s -X POST \
        -F "ifcFile=@test-small.ifc" \
        -F "name=Teste Automatico" \
        -F "description=Teste do script automatico" \
        http://localhost:8081/api/models/ifc/upload)
    
    echo "Resposta do upload:"
    echo "$UPLOAD_RESPONSE"
    
    if [[ "$UPLOAD_RESPONSE" == *"success"* ]] && [[ "$UPLOAD_RESPONSE" == *"true"* ]]; then
        echo "✅ Upload IFC funcionando!"
    else
        echo "❌ Problema no upload IFC"
    fi
else
    echo "⚠️ Arquivo test-small.ifc não encontrado"
fi

echo ""
echo "🏁 Teste concluído!"
