#!/bin/bash

# Script para popular o banco com notificações de teste para os 3 usuários

echo "🌱 Populando banco com notificações de teste..."

# Usuário A - Administrador
echo "📝 Criando notificações para Usuário A..."

curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "userId": "673e4b8f9a1b2c3d4e5f6789",
    "title": "Bem-vindo ao Sistema!",
    "message": "Olá! Você agora faz parte do nosso sistema de notificações. Aproveite todas as funcionalidades disponíveis.",
    "type": "success",
    "priority": "high"
  }' -s > /dev/null

curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "userId": "673e4b8f9a1b2c3d4e5f6789",
    "title": "Reunião de Equipe Agendada",
    "message": "Uma reunião de equipe foi agendada para amanhã às 14:00. Por favor, confirme sua presença no calendário.",
    "type": "info", 
    "priority": "medium"
  }' -s > /dev/null

# Usuário B - Desenvolvedor
echo "👩‍💻 Criando notificações para Usuário B..."

curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "userId": "673e4b8f9a1b2c3d4e5f678a",
    "title": "Deploy em Produção Realizado",
    "message": "O deploy da versão 2.1.0 foi realizado com sucesso em produção. Todas as funcionalidades estão operacionais.",
    "type": "success",
    "priority": "high"
  }' -s > /dev/null

curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "userId": "673e4b8f9a1b2c3d4e5f678a",
    "title": "Bug Report #1234", 
    "message": "Um novo bug foi reportado no módulo de autenticação. Prioridade alta - necessita correção urgente.",
    "type": "error",
    "priority": "high"
  }' -s > /dev/null

curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "userId": "673e4b8f9a1b2c3d4e5f678a",
    "title": "Code Review Pendente",
    "message": "Você tem uma solicitação de code review pendente no PR #567. Por favor, revise quando possível.",
    "type": "warning",
    "priority": "medium"
  }' -s > /dev/null

# Usuário C - Designer
echo "👨‍🎨 Criando notificações para Usuário C..."

curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "userId": "673e4b8f9a1b2c3d4e5f678b", 
    "title": "Novo Projeto de Design",
    "message": "Um novo projeto de redesign da interface foi atribuído a você. Prazo de entrega: próxima sexta-feira.",
    "type": "info",
    "priority": "medium"
  }' -s > /dev/null

curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "userId": "673e4b8f9a1b2c3d4e5f678b",
    "title": "Aprovação de Layout", 
    "message": "O layout da página inicial foi aprovado pelo cliente. Você pode prosseguir com a implementação.",
    "type": "success",
    "priority": "medium"
  }' -s > /dev/null

curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "userId": "673e4b8f9a1b2c3d4e5f678b",
    "title": "Feedback do Cliente",
    "message": "O cliente enviou feedback sobre o protótipo. Algumas alterações menores são necessárias na paleta de cores.",
    "type": "warning", 
    "priority": "low"
  }' -s > /dev/null

echo "✅ Banco populado com sucesso!"
echo "📊 Notificações criadas:"
echo "   👨‍💼 Usuário A: 2 notificações"
echo "   👩‍💻 Usuário B: 3 notificações" 
echo "   👨‍🎨 Usuário C: 3 notificações"
echo ""
echo "🌐 Acesse http://localhost:3000 para testar!"