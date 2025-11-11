#!/bin/bash

# Script de inicialização para desenvolvimento local
# Sistema de Notificações

set -e  # Exit on any error

echo "🚀 Sistema de Notificações - Inicialização para Desenvolvimento"
echo "============================================================="
echo

# Verificar dependências
check_dependencies() {
    echo "🔍 Verificando dependências..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js não encontrado. Instale o Node.js 18 ou superior."
        exit 1
    fi
    
    # npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm não encontrado. Instale o npm."
        exit 1
    fi
    
    # MongoDB (opcional - pode rodar com Docker)
    if ! command -v mongod &> /dev/null; then
        echo "⚠️  MongoDB não encontrado localmente. Certifique-se de ter MongoDB rodando ou use Docker."
    fi
    
    echo "✅ Dependências verificadas!"
}

# Instalar dependências do backend
setup_backend() {
    echo
    echo "📦 Configurando Backend..."
    cd backend
    
    if [ ! -d "node_modules" ]; then
        echo "Instalando dependências do backend..."
        npm install
    else
        echo "Dependências do backend já instaladas."
    fi
    
    # Copiar arquivo de ambiente se não existir
    if [ ! -f ".env" ]; then
        cp .env.example .env
        echo "✅ Arquivo .env criado. Configure conforme necessário."
    fi
    
    cd ..
}

# Instalar dependências do frontend
setup_frontend() {
    echo
    echo "🎨 Configurando Frontend..."
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        echo "Instalando dependências do frontend..."
        npm install
    else
        echo "Dependências do frontend já instaladas."
    fi
    
    # Copiar arquivo de ambiente se não existir
    if [ ! -f ".env" ]; then
        cp .env.example .env
        echo "✅ Arquivo .env criado. Configure conforme necessário."
    fi
    
    cd ..
}

# Executar testes
run_tests() {
    echo
    echo "🧪 Executando testes do backend..."
    cd backend
    npm test
    cd ..
    echo "✅ Testes executados com sucesso!"
}

# Função para iniciar os serviços
start_services() {
    echo
    echo "🚀 Iniciando serviços..."
    echo
    echo "Opções disponíveis:"
    echo "1. Docker Compose (recomendado)"
    echo "2. Desenvolvimento local"
    echo "3. Apenas backend"
    echo "4. Apenas frontend"
    echo
    read -p "Escolha uma opção (1-4): " option
    
    case $option in
        1)
            if command -v docker-compose &> /dev/null; then
                echo "🐳 Iniciando com Docker Compose..."
                docker-compose up --build
            else
                echo "❌ Docker Compose não encontrado. Instale o Docker."
                exit 1
            fi
            ;;
        2)
            echo "💻 Iniciando desenvolvimento local..."
            echo "📝 Abra 3 terminais separados e execute:"
            echo
            echo "Terminal 1 - MongoDB (se local):"
            echo "mongod"
            echo
            echo "Terminal 2 - Backend:"
            echo "cd backend && npm run dev"
            echo
            echo "Terminal 3 - Frontend:"
            echo "cd frontend && npm start"
            echo
            echo "🌐 Depois acesse:"
            echo "Frontend: http://localhost:3000"
            echo "Backend: http://localhost:3001"
            ;;
        3)
            echo "🔧 Iniciando apenas o backend..."
            cd backend
            npm run dev &
            echo "✅ Backend rodando em http://localhost:3001"
            echo "📡 Health check: http://localhost:3001/health"
            wait
            ;;
        4)
            echo "🎨 Iniciando apenas o frontend..."
            cd frontend
            npm start &
            echo "✅ Frontend rodando em http://localhost:3000"
            wait
            ;;
        *)
            echo "❌ Opção inválida."
            exit 1
            ;;
    esac
}

# Menu principal
show_menu() {
    echo
    echo "🛠️  O que você gostaria de fazer?"
    echo
    echo "1. Setup completo (instalar dependências)"
    echo "2. Executar testes"
    echo "3. Iniciar serviços"
    echo "4. Demo da API"
    echo "5. Reset completo"
    echo "6. Sair"
    echo
    read -p "Escolha uma opção (1-6): " choice
    
    case $choice in
        1)
            check_dependencies
            setup_backend
            setup_frontend
            echo "✅ Setup completo realizado!"
            show_menu
            ;;
        2)
            run_tests
            show_menu
            ;;
        3)
            start_services
            ;;
        4)
            if [ -f "demo-api.sh" ]; then
                chmod +x demo-api.sh
                ./demo-api.sh
            else
                echo "❌ Arquivo demo-api.sh não encontrado."
            fi
            show_menu
            ;;
        5)
            echo "🧹 Reset completo..."
            read -p "Tem certeza? Isso removerá node_modules e outros arquivos (y/N): " confirm
            if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
                rm -rf backend/node_modules frontend/node_modules
                rm -f backend/package-lock.json frontend/package-lock.json
                echo "✅ Reset realizado!"
            fi
            show_menu
            ;;
        6)
            echo "👋 Até logo!"
            exit 0
            ;;
        *)
            echo "❌ Opção inválida."
            show_menu
            ;;
    esac
}

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Execute este script no diretório raiz do projeto (onde está o docker-compose.yml)"
    exit 1
fi

# Iniciar menu
show_menu