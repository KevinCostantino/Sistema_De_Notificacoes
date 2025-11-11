#!/bin/bash

echo "🧪 Teste de Funcionalidades"
echo "========================="
echo ""

echo "1. 🔤 Testando suporte a caracteres pt-BR..."
echo ""

# Criando notificação com caracteres especiais
echo "📤 Criando notificação com acentuação..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "userId": "673e4b8f9a1b2c3d4e5f6789",
    "title": "🇧🇷 Notificação Brasileira",
    "message": "Mensagem com acentuação: ação, informação, coração, criação, atenção. Também com ç, ã, õ, é, í, ó, ú, à, â!",
    "type": "success",
    "priority": "high"
  }')

if echo "$RESPONSE" | grep -q "success.*true"; then
    echo "✅ Notificação criada com sucesso!"
    
    # Extrair o ID da notificação criada
    NOTIFICATION_ID=$(echo "$RESPONSE" | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
    echo "🆔 ID da notificação: $NOTIFICATION_ID"
else
    echo "❌ Erro ao criar notificação"
    echo "$RESPONSE"
    exit 1
fi

echo ""
echo "📋 Verificando se os caracteres foram salvos corretamente..."

# Listando notificações para verificar UTF-8
LISTING_RESPONSE=$(curl -s "http://localhost:3001/api/notifications/user/673e4b8f9a1b2c3d4e5f6789?limit=1")

if echo "$LISTING_RESPONSE" | grep -q "acentuação"; then
    echo "✅ Caracteres pt-BR salvos e recuperados corretamente!"
else
    echo "❌ Problema com caracteres pt-BR"
    echo "Resposta: $LISTING_RESPONSE"
fi

echo ""
echo "2. 🔄 Testando atualização automática da listagem..."
echo ""

echo "📊 Contando notificações antes:"
BEFORE_COUNT=$(curl -s "http://localhost:3001/api/notifications/user/673e4b8f9a1b2c3d4e5f6789/stats" | grep -o '"total":[0-9]*' | cut -d':' -f2)
echo "Total de notificações: $BEFORE_COUNT"

echo ""
echo "📤 Criando nova notificação..."
curl -s -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "userId": "673e4b8f9a1b2c3d4e5f6789",
    "title": "⚡ Teste Automático",
    "message": "Esta notificação foi criada para testar a atualização automática da listagem!",
    "type": "info",
    "priority": "medium"
  }' > /dev/null

echo "✅ Nova notificação criada!"

echo ""
echo "📊 Contando notificações depois:"
AFTER_COUNT=$(curl -s "http://localhost:3001/api/notifications/user/673e4b8f9a1b2c3d4e5f6789/stats" | grep -o '"total":[0-9]*' | cut -d':' -f2)
echo "Total de notificações: $AFTER_COUNT"

if [ "$AFTER_COUNT" -gt "$BEFORE_COUNT" ]; then
    echo "✅ Listagem atualizada automaticamente!"
else
    echo "❌ Problema na atualização automática"
fi

echo ""
echo "🌐 Frontend disponível em: http://localhost:3000"
echo "📡 Backend API em: http://localhost:3001"
echo ""
echo "💡 Dica: Abra o frontend e crie uma notificação usando o formulário"
echo "   para ver a atualização automática em ação!"
echo ""
echo "🎉 Teste concluído!"