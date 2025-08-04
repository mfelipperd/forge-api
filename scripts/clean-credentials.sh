#!/bin/bash

# 🔒 Script para limpar credenciais comprometidas do histórico Git
# ⚠️  CUIDADO: Isso reescreve o histórico Git!

echo "🚨 LIMPEZA DE CREDENCIAIS COMPROMETIDAS"
echo "======================================"
echo ""
echo "⚠️  Este script irá reescrever o histórico Git!"
echo "   Todos os colaboradores precisarão fazer fresh clone"
echo ""
read -p "Continuar? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operação cancelada"
    exit 1
fi

echo "🔄 Removendo credenciais do histórico..."

# Remove todas as ocorrências das credenciais comprometidas
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch .env' \
--prune-empty --tag-name-filter cat -- --all

git filter-branch --force --tree-filter \
'find . -name "*.js" -o -name "*.ts" -o -name "*.json" -o -name "*.md" | \
xargs sed -i "s/wtEH7i4T3HCzsfL9N1BG8iZjEVvMUwNm1DJzRoeki7QtbVYA/[REMOVED_CLIENT_ID]/g"' \
--prune-empty --tag-name-filter cat -- --all

git filter-branch --force --tree-filter \
'find . -name "*.js" -o -name "*.ts" -o -name "*.json" -o -name "*.md" | \
xargs sed -i "s/WsAtcTsJf5xlWFt0Wpr9BVpiMSBefmrtO19AsAmNxSn9269vgdezC8DWBEAGhz0y/[REMOVED_CLIENT_SECRET]/g"' \
--prune-empty --tag-name-filter cat -- --all

echo "🧹 Limpando referências..."
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Credenciais removidas do histórico Git"
echo ""
echo "🚨 PRÓXIMOS PASSOS OBRIGATÓRIOS:"
echo "1. Revogue as credenciais antigas na Autodesk"
echo "2. Gere novas credenciais"
echo "3. Atualize seu arquivo .env local"
echo "4. Force push: git push --force-with-lease origin --all"
echo "5. Notifique todos os colaboradores para fazer fresh clone"
echo ""
echo "⚠️  Todos os collaboradores precisarão executar:"
echo "   git clone <repo_url> novo_folder"
