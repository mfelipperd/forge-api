#!/bin/bash

# 🔒 Script de verificação de segurança
# Verifica se há credenciais expostas no código

echo "🔍 AUDITORIA DE SEGURANÇA"
echo "======================="
echo ""

# Função para verificar credenciais comprometidas
check_compromised_creds() {
    echo "🔍 Verificando credenciais comprometidas..."
    
    # Procurar credenciais, excluindo arquivos seguros
    creds_found=$(grep -r "wtEH7i4T3H\|WsAtcTsJf5xl" . \
        --exclude-dir=node_modules \
        --exclude-dir=.git \
        --exclude="*.sh" \
        --exclude=".env" \
        --exclude="SECURITY.md" \
        2>/dev/null)
    
    if [[ -n "$creds_found" ]]; then
        echo "❌ CREDENCIAL COMPROMETIDA ENCONTRADA!"
        echo "$creds_found"
        return 1
    fi
    
    echo "✅ Nenhuma credencial comprometida encontrada no código"
    return 0
}

# Função para verificar .env
check_env_file() {
    echo ""
    echo "🔍 Verificando arquivo .env..."
    
    if [[ ! -f ".env" ]]; then
        echo "⚠️  Arquivo .env não encontrado"
        echo "   Execute: cp .env.example .env"
        return 1
    fi
    
    if [[ -f ".env" ]] && grep -q "your_forge_client_id_here" .env; then
        echo "⚠️  Arquivo .env ainda tem placeholders"
        echo "   Configure suas credenciais reais"
        return 1
    fi
    
    echo "✅ Arquivo .env configurado"
    return 0
}

# Função para verificar .gitignore
check_gitignore() {
    echo ""
    echo "🔍 Verificando .gitignore..."
    
    if ! grep -q "^\.env$" .gitignore; then
        echo "❌ .env não está sendo ignorado pelo Git!"
        echo "   Adicione '.env' ao .gitignore"
        return 1
    fi
    
    echo "✅ .env está sendo ignorado pelo Git"
    return 0
}

# Função para verificar se .env está no Git
check_env_in_git() {
    echo ""
    echo "🔍 Verificando se .env está no controle de versão..."
    
    if git ls-files --error-unmatch .env >/dev/null 2>&1; then
        echo "❌ PERIGO: .env está sendo trackeado pelo Git!"
        echo "   Execute: git rm --cached .env"
        return 1
    fi
    
    echo "✅ .env não está no controle de versão"
    return 0
}

# Executar verificações
errors=0

check_compromised_creds || ((errors++))
check_env_file || ((errors++))
check_gitignore || ((errors++))
check_env_in_git || ((errors++))

echo ""
echo "======================="

if [[ $errors -eq 0 ]]; then
    echo "✅ AUDITORIA PASSOU - Segurança OK"
    exit 0
else
    echo "❌ AUDITORIA FALHOU - $errors problemas encontrados"
    echo ""
    echo "🚨 AÇÕES NECESSÁRIAS:"
    echo "1. Revogue credenciais comprometidas"
    echo "2. Configure .env corretamente"  
    echo "3. Verifique .gitignore"
    echo "4. Remova .env do Git se necessário"
    exit 1
fi
