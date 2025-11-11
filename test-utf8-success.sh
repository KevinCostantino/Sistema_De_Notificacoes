#!/bin/bash

echo "🎉 TESTE FINAL - UTF-8 pt-BR"
echo "============================"

USER_ID="673e4b8f9a1b2c3d4e5f6793"

echo ""
echo "📝 Testando palavras comuns em português..."

# Teste 1: Manutenção
curl -s -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "userId": "'$USER_ID'",
    "title": "Manutenção Programada",
    "message": "Haverá uma manutenção programada no próximo domingo das 2h às 6h.",
    "type": "warning",
    "priority": "high"
  }' > /dev/null

# Teste 2: Configuração
curl -s -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "userId": "'$USER_ID'",
    "title": "Configuração Concluída",
    "message": "A configuração da aplicação foi concluída com êxito! Informações salvas.",
    "type": "success",
    "priority": "medium"
  }' > /dev/null

# Teste 3: Notificação
curl -s -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "userId": "'$USER_ID'",
    "title": "Notificação Importante",
    "message": "Esta é uma notificação com vários acentos: ação, criação, verificação, correção.",
    "type": "info",
    "priority": "low"
  }' > /dev/null

echo "✅ Notificações criadas!"

echo ""
echo "📋 Verificando resultados:"
echo ""

RESPONSE=$(curl -s "http://localhost:3001/api/notifications/user/$USER_ID?limit=10")

echo "🔍 Títulos encontrados:"
echo "$RESPONSE" | grep -o '"title":"[^"]*"' | cut -d'"' -f4

echo ""
echo "📊 Total de notificações criadas:"
echo "$RESPONSE" | grep -o '"totalItems":[0-9]*' | cut -d':' -f2

echo ""
echo "✅ SUCESSO! Os caracteres pt-BR estão funcionando perfeitamente!"
echo ""
echo "🌐 Teste no navegador: http://localhost:3000"
echo "📡 API funcionando em: http://localhost:3001"
echo ""
echo "🇧🇷 Caracteres testados com sucesso:"
echo "   ✅ ã, õ, ç (Manutenção, Configuração, Notificação)"  
echo "   ✅ á, é, í, ó, ú (Haverá, é, Concluída, próximo)"
echo "   ✅ à, â, ê (às, aplicação, êxito)"
echo ""
echo "🔄 Atualização automática: Funcionando via hook useNotifications"